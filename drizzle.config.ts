import type { Config } from "drizzle-kit";

// drizzle-kit runs under Node and needs a DIRECT (unpooled) connection —
// advisory locks and DDL misbehave through Neon's pooler. Run migration
// commands via bun (`bunx drizzle-kit ...`) so .env is loaded.
export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
} satisfies Config;
