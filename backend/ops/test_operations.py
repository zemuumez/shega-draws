import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest
spec=importlib.util.spec_from_file_location('ops',Path(__file__).with_name('operations.py'))
ops=importlib.util.module_from_spec(spec);spec.loader.exec_module(ops)
class RecoveryTests(unittest.TestCase):
 def archive(self,root,entries):
  path=root/'fixture.tar'
  with tarfile.open(path,'w') as tar:
   for name,data in entries:
    member=tarfile.TarInfo(name);member.size=len(data);tar.addfile(member,io.BytesIO(data))
  return path
 def test_traversal_and_duplicates_rejected(self):
  for entries in [[('../outside',b'x')],[('database.dump',b'x'),('database.dump',b'x')]]:
   with tempfile.TemporaryDirectory() as d:
    root=Path(d)
    with self.assertRaises(RuntimeError):ops.unpack(self.archive(root,entries),root/'out')
 def test_complete_manifest_and_hash_required(self):
  for expected,ok in [(hashlib.sha256(b'dump').hexdigest(),True),('wrong',False)]:
   with tempfile.TemporaryDirectory() as d:
    root=Path(d);manifest=json.dumps({'format':1,'files':{'database.dump':expected}}).encode()
    archive=self.archive(root,[('database.dump',b'dump'),('manifest.json',manifest)])
    if ok:ops.unpack(archive,root/'out')
    else:
     with self.assertRaises(RuntimeError):ops.unpack(archive,root/'out')
 def test_postgres_uri_is_parsed_without_secret_arguments(self):
  env=ops.pg_env('postgresql://user:secret%40value@localhost:55439/database?sslmode=require')
  self.assertEqual(env['PGDATABASE'],'database')
  self.assertEqual(env['PGPASSWORD'],'secret@value')
  self.assertEqual(env['PGPORT'],'55439')
  self.assertEqual(env['PGSSLMODE'],'require')
 def test_identity_ignores_credentials(self):
  self.assertEqual(ops.database_identity('postgres://user:secret@host/db'),ops.database_identity('postgresql://other:changed@host:5432/db?sslmode=require'))
if __name__=='__main__':unittest.main()
