import path from "path";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { loadEnvVariables } from "./utils";

loadEnvVariables();

async function main() {
  const { client, db } = await import("./drizzle");
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "/src/db/migrations"),
  });
  console.log(`Migrations complete`);
  await client.end();
}

main();
