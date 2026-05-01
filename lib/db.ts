import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/drizzle/schema";

declare global {
  // eslint-disable-next-line no-var
  var __bekasen_pg_pool: Pool | undefined;
}

const pool =
  global.__bekasen_pg_pool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://bekasen:dev@localhost:5432/bekasen",
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__bekasen_pg_pool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
