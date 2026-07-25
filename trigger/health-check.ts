import { schedules, logger } from "@trigger.dev/sdk";
import { sql } from "drizzle-orm";
import { db } from "../db";

// Fires every minute. Logs a timestamp and confirms DB connectivity — the
// heartbeat that proves the job pipeline is alive (Phase 0 gate).
export const healthCheck = schedules.task({
  id: "health-check",
  cron: "* * * * *",
  run: async (payload) => {
    const rows = await db.execute(sql`select now() as db_time`);
    const dbTime = (rows as unknown as { db_time: string }[])[0]?.db_time ?? null;
    logger.info("health-check ok", { scheduledFor: payload.timestamp, dbTime });
    return { ok: true, dbTime };
  },
});
