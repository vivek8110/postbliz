"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { tasks } from "@trigger.dev/sdk";
import type { ingestCrawlSite } from "@/trigger/ingest-crawl-site";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function createProject(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "UTC").trim() || "UTC";
  if (!name || !url) redirect("/new?error=missing");

  const [project] = await db
    .insert(projects)
    .values({ userId: session.user.id, name, url, timezone })
    .returning();
  if (!project) redirect("/new?error=missing");

  // Kick off the crawl + brand analysis. The handle's publicAccessToken lets the
  // onboarding page subscribe to live progress.
  const handle = await tasks.trigger<typeof ingestCrawlSite>("ingest.crawl-site", {
    projectId: project.id,
    userId: session.user.id,
    url,
  });

  redirect(`/onboarding?run=${handle.id}&pk=${encodeURIComponent(handle.publicAccessToken)}`);
}
