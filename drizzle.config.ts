import { config as loadEnv } from "dotenv";
// Match Next.js precedence: .env.local overrides .env
loadEnv({ path: ".env.local" });
loadEnv();
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://bekasen:dev@localhost:5433/bekasen",
  },
  verbose: true,
  strict: true,
});
