import { task, logger } from "@trigger.dev/sdk";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { scheduledPosts } from "../db/schema";

/**
 * REFERENCE IMPLEMENTATION — not wired into anything, safe to trigger by hand.
 * Phase 3 (publishing) builds `publish.execute` on this exact shape; it lives
 * here so the claim pattern is settled before the critical path is written.
 *
 * Hard Rule 5 — every publish is idempotent, via two guards together:
 *   1. Unique constraint on scheduled_posts.idempotency_key (set at queue.fill).
 *   2. Claim-row-first: inside one transaction, SELECT ... FOR UPDATE the row and
 *      flip queued -> publishing. A retry that arrives while another worker holds
 *      the row, or after it already published, sees status != 'queued' and exits
 *      silently. A double-post is worse than a missed post.
 */
export const exampleClaim = task({
  id: "_example-claim",
  run: async (payload: { scheduledPostId: string }) => {
    const claimedId = await db.transaction(async (tx) => {
      // Lock the row for the duration of this transaction.
      const [row] = await tx
        .select({ id: scheduledPosts.id, status: scheduledPosts.status })
        .from(scheduledPosts)
        .where(eq(scheduledPosts.id, payload.scheduledPostId))
        .for("update");

      // Retry guard: only a 'queued' row may be claimed.
      if (!row || row.status !== "queued") return null;

      await tx
        .update(scheduledPosts)
        .set({
          status: "publishing",
          attemptCount: sql`${scheduledPosts.attemptCount} + 1`,
        })
        .where(and(eq(scheduledPosts.id, row.id), eq(scheduledPosts.status, "queued")));

      return row.id;
    });

    if (!claimedId) {
      logger.info("row already claimed or not queued — exiting (retry guard)");
      return { claimed: false };
    }

    // Phase 3 continues here: reddit.safety-gate → token check → strip URLs (X) →
    // platform call → status published (store platform_post_id + permalink) or
    // held (plain-language reason). Left out — this is only the claim reference.
    logger.info("claimed row for publishing", { scheduledPostId: claimedId });
    return { claimed: true, scheduledPostId: claimedId };
  },
});
