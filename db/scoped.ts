import { and, eq, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Forces a `user_id` filter onto any query over a user-scoped table.
 *
 * Every hand-written query that touches user data MUST build its WHERE through
 * this helper. Bare `where` clauses on user data are how tenant leaks happen in
 * a public repo (Hard Rule: tenancy). Composing the filter here keeps the
 * `user_id` check impossible to forget.
 *
 * Usage:
 *   db.select().from(projects).where(scoped(projects.userId, userId));
 *   db.select().from(drafts)
 *     .where(scoped(drafts.userId, userId, eq(drafts.status, "generated")));
 *
 * Exception — `link_clicks`: the one table with no `user_id` (public visitor
 * traffic, reached via `link → project`). Do NOT force a bogus `user_id` onto
 * it; scope its reads through the parent `links.userId` instead. See db/schema.ts.
 */
export function scoped(
  userIdColumn: PgColumn,
  userId: string,
  ...extra: (SQL | undefined)[]
): SQL {
  const filters: SQL[] = [
    eq(userIdColumn, userId),
    ...extra.filter((f): f is SQL => f !== undefined),
  ];
  // `and` returns undefined only for an empty list; we always have the eq above.
  return and(...filters)!;
}
