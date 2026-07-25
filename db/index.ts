import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// App runtime uses the POOLED connection (DATABASE_URL). `prepare: false`
// because Neon's pooler runs PgBouncer in transaction mode, which does not
// support prepared statements. Migrations use the DIRECT url — see drizzle.config.ts.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

// Reuse one client across hot-reloads in dev so we don't exhaust connections.
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };
const client = globalForDb.pgClient ?? postgres(connectionString, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export type DB = typeof db;
export { schema };
