"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { knowledgeItems } from "@/db/schema";
import { scoped } from "@/db/scoped";

export async function deleteFact(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  await db.delete(knowledgeItems).where(scoped(knowledgeItems.userId, session.user.id, eq(knowledgeItems.id, id)));
  revalidatePath("/app/knowledge");
}

export async function updateFact(id: string, fact: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const trimmed = fact.trim();
  if (!trimmed) return;
  await db
    .update(knowledgeItems)
    .set({ fact: trimmed })
    .where(scoped(knowledgeItems.userId, session.user.id, eq(knowledgeItems.id, id)));
  revalidatePath("/app/knowledge");
}
