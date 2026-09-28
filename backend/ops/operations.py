#!/usr/bin/env python3
"""Trusted operator runner. No shell execution or public restore endpoint.
Environment: OPS_DATABASE_URL, RESTIC_REPOSITORY, RESTIC_PASSWORD_FILE,
MEDIA_DIR. Restore additionally requires RESTORE_DATABASE_URL.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tarfile
import tempfile
import time
from urllib.parse import urlparse, unquote, parse_qsl
import uuid


def run(args, *, env=None, stdin=None, stdout=None, timeout=1800):
    result = subprocess.run(args, env=env, stdin=stdin, stdout=stdout or subprocess.PIPE,
                            stderr=subprocess.PIPE, timeout=timeout, check=False)
    if result.returncode:
        # Tool errors can contain database URIs or repository credentials.
        raise RuntimeError(f"{Path(args[0]).name} failed (exit {result.returncode}); inspect the service configuration")
    return result.stdout.decode() if stdout is None else ""


def pg_env(dsn):
    env = dict(os.environ)
    parsed=urlparse(dsn)
    database_identity(dsn)
    for key in ('PGSERVICE', 'PGSERVICEFILE', 'PGHOST', 'PGHOSTADDR', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'PGOPTIONS'):
        env.pop(key,None)
    env['PGHOST']=parsed.hostname
    env['PGPORT']=str(parsed.port or 5432)
    env['PGDATABASE']=unquote(parsed.path.lstrip('/'))
    if parsed.username:env['PGUSER']=unquote(parsed.username)
    if parsed.password:env['PGPASSWORD']=unquote(parsed.password)
    allowed={'sslmode':'PGSSLMODE','sslrootcert':'PGSSLROOTCERT','sslcert':'PGSSLCERT','sslkey':'PGSSLKEY','application_name':'PGAPPNAME'}
    for key,value in parse_qsl(parsed.query):
        if key not in allowed:raise RuntimeError('Unsupported operator database URL parameter')
        env[allowed[key]]=value
    env['PGCONNECT_TIMEOUT'] = '10'
    return env


def sql(dsn, query):
    return run(['psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-c', query],
               env=pg_env(dsn), timeout=60).strip()


def quoted(value):
    return "'" + value.replace("'", "''") + "'"


def require(name):
    value = os.environ.get(name, '')
    if not value:
        raise RuntimeError(f"Configure {name}")
    return value


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def schedule(dsn):
    ident = uuid.uuid4().hex
    sql(dsn, f"""INSERT INTO backup_jobs(id,requested_by)
        SELECT '{ident}','scheduled-operator' WHERE NOT EXISTS
        (SELECT 1 FROM backup_jobs WHERE status IN ('queued','running') OR
         requested_at>now()-interval '1 hour') ON CONFLICT DO NOTHING;""")


def backup_once(dsn):
    require('RESTIC_REPOSITORY')
    require('RESTIC_PASSWORD_FILE')
    media = Path(require('MEDIA_DIR')).resolve()
    if not media.is_dir():
        raise RuntimeError('MEDIA_DIR must exist, even when empty')
    # A hard-killed runner leaves a failed record after its bounded job window.
    sql(dsn, "UPDATE backup_jobs SET status='failed',finished_at=now(),message='Operator interrupted; request a new backup' WHERE status='running' AND started_at<now()-interval '2 hours'")
    job = sql(dsn, """WITH candidate AS (SELECT id FROM backup_jobs WHERE status='queued'
        ORDER BY requested_at FOR UPDATE SKIP LOCKED LIMIT 1)
        UPDATE backup_jobs SET status='running',started_at=now() FROM candidate
        WHERE backup_jobs.id=candidate.id RETURNING backup_jobs.id""")
    if not job:
        return
    if not re.fullmatch(r'[a-f0-9]{32}', job):
        raise RuntimeError('Invalid job identifier')
    started = time.time()
    try:
        with tempfile.TemporaryDirectory(prefix='rimna-backup-') as directory:
            root = Path(directory)
            dump = root / 'database.dump'
            # This is a transaction-consistent database snapshot, including auth.
            run(['pg_dump', '--format=custom', '--no-owner', '--no-acl', '--file', str(dump)],
                env=pg_env(dsn), timeout=900)
            files = {'database.dump': digest(dump)}
            sources = {'database.dump': dump}
            # Imported media is immutable. Finish imports before backing up.
            for path in sorted(media.iterdir()):
                if path.is_symlink() or not path.is_file() or not re.fullmatch(r'[a-f0-9]{64}', path.name):
                    raise RuntimeError('Unexpected file in private media directory')
                if digest(path) != path.name:
                    raise RuntimeError('Private media hash mismatch')
                key = 'media/' + path.name
                files[key] = path.name
                sources[key] = path
            manifest = {'format': 1, 'job': job, 'createdAt': time.time(), 'files': files,
                        'scope': 'PostgreSQL public+auth and immutable private media; secrets and Sanity separate'}
            (root / 'manifest.json').write_text(json.dumps(manifest))
            archive = root / 'rimna.tar'
            with tarfile.open(archive, 'w') as tar:
                tar.add(root / 'manifest.json', arcname='manifest.json', recursive=False)
                for name, path in sources.items():
                    tar.add(path, arcname=name, recursive=False)
            with archive.open('rb') as incoming:
                output = run(['restic', 'backup', '--json', '--tag', 'rimna-operations',
                              '--stdin', '--stdin-filename', 'rimna.tar'], stdin=incoming, timeout=1800)
            summaries = [json.loads(line) for line in output.splitlines() if line.strip()]
            snapshot = next((s.get('snapshot_id') for s in summaries if s.get('message_type') == 'summary'), None)
            if not snapshot or not re.fullmatch(r'[a-f0-9]{64}', snapshot):
                raise RuntimeError('Backup did not return a snapshot reference')
            run(['restic', 'check'], timeout=1200)
        sql(dsn, f"UPDATE backup_jobs SET status='succeeded',finished_at=now(),snapshot_id='{snapshot}',message='Encrypted archive stored; repository structure checked. Restore drill is separate.' WHERE id='{job}' AND status='running'")
        print(json.dumps({'event': 'backup_succeeded', 'job': job, 'snapshot': snapshot,
                          'seconds': round(time.time() - started)}), flush=True)
    except Exception:
        sql(dsn, f"UPDATE backup_jobs SET status='failed',finished_at=now(),message='Backup failed; operator must check storage, connectivity and configuration' WHERE id='{job}' AND status='running'")
        raise


def database_identity(dsn):
    parsed = urlparse(dsn)
    if parsed.scheme not in ('postgres', 'postgresql') or not parsed.hostname or not parsed.path.strip('/'):
        raise RuntimeError('Use an explicit PostgreSQL URL for source and restore target')
    return parsed.hostname.lower(), parsed.port or 5432, parsed.path


def unpack(archive, target):
    total = 0
    names = set()
    with tarfile.open(archive) as tar:
        for member in tar:
            name = member.name
            if (not member.isfile() or name in names or
                not (name in ('manifest.json', 'database.dump') or re.fullmatch(r'media/[a-f0-9]{64}', name))):
                raise RuntimeError('Unsafe or duplicate archive member')
            names.add(name)
            total += member.size
            if total > int(os.environ.get('RESTORE_MAX_BYTES', str(100 * 1024**3))) or len(names) > 200002:
                raise RuntimeError('Archive exceeds restore limits')
            path = target / name
            path.parent.mkdir(parents=True, exist_ok=True)
            with tar.extractfile(member) as source, path.open('xb') as out:
                shutil.copyfileobj(source, out)
    manifest = json.loads((target / 'manifest.json').read_text())
    if manifest.get('format') != 1 or not isinstance(manifest.get('files'), dict):
        raise RuntimeError('Unsupported backup manifest')
    if set(manifest['files']) | {'manifest.json'} != names or 'database.dump' not in names:
        raise RuntimeError('Archive is incomplete')
    for name, expected in manifest['files'].items():
        if digest(target / name) != expected:
            raise RuntimeError('Backup checksum mismatch')


def restore(snapshot, media_destination):
    source = require('OPS_DATABASE_URL')
    target = require('RESTORE_DATABASE_URL')
    require('RESTIC_REPOSITORY')
    require('RESTIC_PASSWORD_FILE')
    if not re.fullmatch(r'[a-f0-9]{64}', snapshot):
        raise RuntimeError('Select an explicit full snapshot ID; latest is not accepted')
    if database_identity(source) == database_identity(target):
        raise RuntimeError('Restore target must be different from the source database')
    if sql(target, "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND c.relkind IN ('r','p','v','m','S')") != '0':
        raise RuntimeError('Restore only into a new, empty database')
    destination = Path(media_destination).resolve()
    if destination.exists():
        raise RuntimeError('Restore media destination must be new')
    started = time.time()
    with tempfile.TemporaryDirectory(prefix='rimna-restore-') as directory:
        root = Path(directory)
        with (root / 'archive.tar').open('wb') as archive:
            run(['restic', 'dump', snapshot, '/rimna.tar'], stdout=archive, timeout=1800)
        unpack(root / 'archive.tar', root / 'verified')
        # Never point an application or a payment worker at this target yet.
        run(['pg_restore', '--no-owner', '--no-acl', '--file', str(root / 'restore.sql'),
             str(root / 'verified/database.dump')], timeout=1800)
        lockdown = """
            SET LOCAL search_path=public;
            UPDATE operations_control SET recovery_locked=true,sales_paused=true,
              reason='Restored database: reconcile provider payments before reopening',updated_at=now(),updated_by='recovery-operator';
            DO $$ BEGIN
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='operations_control' AND column_name='deposits_paused') THEN
                UPDATE operations_control SET deposits_paused=true;
              END IF;
            END $$;
            UPDATE backup_jobs SET status='failed',finished_at=now(),message='Job interrupted by restore' WHERE status IN ('queued','running');
            DELETE FROM worker_heartbeats;
            DO $$ BEGIN IF to_regclass('auth.session') IS NOT NULL THEN DELETE FROM auth.session; END IF; END $$;
            INSERT INTO audit_log(actor,action,resource) VALUES('recovery-operator','recovery.restore',
            'Isolated restoration; sales and workers locked');"""
        # Restore and recovery lock commit together, with no unlocked interval.
        run(['psql', '-X', '-v', 'ON_ERROR_STOP=1', '--single-transaction', '--file', str(root / 'restore.sql'),
             '--command', lockdown], env=pg_env(target), timeout=1800)
        duplicates = sql(target, "SELECT count(*) FROM (SELECT draw_id,number FROM orders WHERE status IN ('initializing','pending','paid','legacy_pending') GROUP BY draw_id,number HAVING count(*)>1) d")
        if duplicates != '0':
            raise RuntimeError('Restored ticket integrity check failed')
        media = root / 'verified/media'
        if media.exists():
            shutil.copytree(media, destination)
        else:
            destination.mkdir(parents=True)
    print(json.dumps({'event': 'restore_complete', 'snapshot': snapshot,
                      'seconds': round(time.time() - started), 'recoveryLocked': True,
                      'next': 'Verify totals, restore separate secrets and reconcile payments; operator approves cutover'}))


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('once')
    sub.add_parser('schedule')
    recover = sub.add_parser('restore')
    recover.add_argument('snapshot')
    recover.add_argument('--media-destination', required=True)
    args = parser.parse_args()
    if args.command == 'restore':
        restore(args.snapshot, args.media_destination)
    else:
        dsn = require('OPS_DATABASE_URL')
        if args.command == 'schedule':
            schedule(dsn)
        backup_once(dsn)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Do not print raw command errors or connection settings.
        print(json.dumps({'event': 'operations_failed', 'errorType': type(error).__name__,
                          'action': 'Operator must investigate; no success reported'}), flush=True)
        raise SystemExit(1)
