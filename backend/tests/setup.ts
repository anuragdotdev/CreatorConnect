import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

/**
 * Point the process at an isolated test database before any Prisma client is
 * created, so the automated tests never touch the demo development data.
 */
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test.db";

/** Creates (or resets) the schema of the test database. */
export function resetTestDatabase(): void {
  execSync("npx prisma db push --force-reset --skip-generate", {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "ignore",
  });
}

resetTestDatabase();
