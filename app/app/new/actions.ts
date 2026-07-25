"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function createProject(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "UTC").trim() || "UTC";
  if (!name || !url) redirect("/app/new?error=missing");

  await db.insert(projects).values({ userId: session.user.id, name, url, timezone });
  redirect("/app");
}
