import dotenv from "dotenv";
import { resolve } from "path";
import { config } from "dotenv";

export function loadEnvVariables(): void {
  const envPath = resolve(process.cwd(), ".env");
  const envLocalPath = resolve(process.cwd(), ".env.local");

  config({ path: envPath });
  config({ path: envLocalPath, override: true });
  dotenv.config();
}
