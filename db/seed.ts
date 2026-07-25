import { db } from "./index";
import { projects, channels } from "./schema";
import { scoped } from "./scoped";

// Local dev seed: one project + one channel for a placeholder user.
// The `users` table is owned by BetterAuth (Task 0.3) and doesn't exist yet;
// `user_id` here is just text with no FK. Re-running is idempotent — it clears
// this dev user's projects first (channels cascade).
async function seed() {
  const userId = "00000000-0000-7000-8000-000000000001";

  await db.delete(projects).where(scoped(projects.userId, userId));

  const [project] = await db
    .insert(projects)
    .values({
      userId,
      name: "Postbliz",
      url: "https://postbliz.co",
      timezone: "Asia/Kolkata",
    })
    .returning();
  if (!project) throw new Error("failed to insert project");

  const [channel] = await db
    .insert(channels)
    .values({
      projectId: project.id,
      userId,
      platform: "x",
      handle: "@marcbuilds",
      displayName: "Marc",
      platformUserId: "x-dev-0001",
    })
    .returning();

  console.log(`seeded project ${project.id}`);
  console.log(`seeded channel ${channel?.id}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
