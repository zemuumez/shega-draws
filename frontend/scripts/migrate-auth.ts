import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { getMigrations } from "better-auth/db/migration";
import { authOptions } from "../lib/auth";
loadEnvConfig(process.cwd());
async function main() {
  if (!process.env.AUTH_DATABASE_URL) throw new Error("Set AUTH_DATABASE_URL");
  const db = new Pool({ connectionString: process.env.AUTH_DATABASE_URL });
  await db.query("CREATE SCHEMA IF NOT EXISTS auth");
  const migration = await getMigrations(authOptions());
  if (process.argv.includes("--apply")) {
    await migration.runMigrations();
    console.log("Authentication schema migrated.");
  } else console.log(await migration.compileMigrations());
  await db.end();
}
main()
  .then(() => process.exit(0))
  .catch(() => {
    console.error(
      "Authentication migration failed; check database access and environment configuration.",
    );
    process.exit(1);
  });
