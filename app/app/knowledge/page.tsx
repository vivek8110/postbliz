import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, knowledgeItems, brandProfiles } from "@/db/schema";
import { scoped } from "@/db/scoped";
import { EmptyState } from "../empty-state";
import { KnowledgeScreen } from "./knowledge-screen";

export default async function KnowledgePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const uid = session.user.id;

  const projs = await db
    .select({ id: projects.id })
    .from(projects)
    .where(scoped(projects.userId, uid))
    .orderBy(desc(projects.createdAt));
  if (projs.length === 0) redirect("/new");

  const cookieStore = await cookies();
  const activeId = cookieStore.get("pb_project")?.value;
  const active = projs.find((p) => p.id === activeId)?.id ?? projs[0]!.id;

  // Never select the embedding column — it's huge and the client doesn't need it.
  const facts = await db
    .select({
      id: knowledgeItems.id,
      fact: knowledgeItems.fact,
      category: knowledgeItems.category,
      specificity: knowledgeItems.specificity,
      sourceUrl: knowledgeItems.sourceUrl,
      sourceQuote: knowledgeItems.sourceQuote,
    })
    .from(knowledgeItems)
    .where(scoped(knowledgeItems.userId, uid, eq(knowledgeItems.projectId, active)))
    .orderBy(desc(knowledgeItems.specificity));

  const brand = (
    await db
      .select({
        whatItDoes: brandProfiles.whatItDoes,
        whoItsFor: brandProfiles.whoItsFor,
        category: brandProfiles.category,
        vocabulary: brandProfiles.vocabulary,
      })
      .from(brandProfiles)
      .where(scoped(brandProfiles.userId, uid, eq(brandProfiles.projectId, active)))
      .limit(1)
  )[0];

  if (facts.length === 0) {
    return (
      <EmptyState title="No facts yet">
        Add a source and Postbliz will pull out what&apos;s worth posting. Every post traces back to one of these.
      </EmptyState>
    );
  }

  return (
    <KnowledgeScreen
      facts={facts}
      brand={brand ? { ...brand, vocabulary: brand.vocabulary ?? [] } : null}
    />
  );
}
