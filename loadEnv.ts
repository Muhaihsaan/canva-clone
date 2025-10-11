import { config } from "dotenv";
import path from "path";
import fs from "fs";

const envPath = path.join(process.cwd(), ".env.test");

if (fs.existsSync(envPath)) {
  config({ path: envPath });
  console.log(`[env] Loaded environment from ${envPath}`);
} else {
  console.warn(`[env] ⚠️ No .env file found at ${envPath}`);
}
