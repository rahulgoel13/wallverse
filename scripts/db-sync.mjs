/**
 * Syncs the database schema and seeds an empty catalogue — only when the store
 * runs on a database (DATA_SOURCE=database). In the default static mode it does
 * nothing, so builds never need, or touch, a database.
 *
 * Run: node scripts/db-sync.mjs
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

// Local runs read .env; deployments (no .env file) use the platform's variables.
if (existsSync(".env")) process.loadEnvFile?.(".env");

if (process.env.DATA_SOURCE !== "database") {
  console.log("Static mode (DATA_SOURCE is not 'database'): no database to sync.");
  process.exit(0);
}

for (const step of ["prisma db push --skip-generate", "prisma db seed"]) {
  console.log(`> ${step}`);
  execSync(`npx ${step}`, { stdio: "inherit" });
}
