import path from "path";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { client, db } from "./drizzle";
import { loadEnvVariables } from "./utils";

loadEnvVariables();

async function main() {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "/src/db/migrations"),
  });
  console.log(`Migrations complete`);
  await client.end();
}

main();
