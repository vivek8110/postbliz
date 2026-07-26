import { task, metadata, logger } from "@trigger.dev/sdk";
import { and, eq } from "drizzle-orm";
import { crawlSite, CrawlError } from "../lib/crawl/firecrawl";
import { runBrandAnalyst } from "../lib/agents/brand-analyst";
import { runFactExtractor } from "../lib/agents/fact-extractor";
import { embedFacts, cosine } from "../lib/ai/embeddings";
import { db } from "../db";
import { brandProfiles, knowledgeItems, projects } from "../db/schema";

// ingest.crawl-site — Firecrawl the site, run the Brand Analyst (profile) and the
// Fact Extractor (knowledge_items), streaming progress via run metadata (the
// onboarding "watch it work" moment).
export const ingestCrawlSite = task({
  id: "ingest.crawl-site",
  run: async (payload: { projectId: string; userId: string; url: string }) => {
    metadata.set("status", "crawling");
    metadata.set("url", payload.url);

    let crawl;
    try {
      crawl = await crawlSite(payload.url, 10);
    } catch (e) {
      if (e instanceof CrawlError) {
        metadata.set("status", "error");
        metadata.set("error", e.userMessage);
        logger.warn("crawl failed", { url: payload.url, message: e.userMessage });
        return { ok: false as const, error: e.userMessage };
      }
      throw e;
    }
    metadata.set("pagesFound", crawl.pages.length);

    // ── Brand profile (frontier) ──
    metadata.set("status", "analyzing");
    const profile = await runBrandAnalyst({
      userId: payload.userId,
      projectId: payload.projectId,
      pages: crawl.pages,
    });

    const now = new Date();
    await db
      .insert(brandProfiles)
      .values({
        projectId: payload.projectId,
        userId: payload.userId,
        whatItDoes: profile.whatItDoes,
        whoItsFor: profile.whoItsFor,
        problemSolved: profile.problemSolved,
        category: profile.category,
        competitors: profile.competitors,
        vocabulary: profile.vocabulary,
        avoidTerms: profile.avoidTerms,
        toneMarkers: profile.toneMarkers,
        crawledAt: now,
      })
      .onConflictDoUpdate({
        target: brandProfiles.projectId,
        set: {
          whatItDoes: profile.whatItDoes,
          whoItsFor: profile.whoItsFor,
          problemSolved: profile.problemSolved,
          category: profile.category,
          competitors: profile.competitors,
          vocabulary: profile.vocabulary,
          avoidTerms: profile.avoidTerms,
          toneMarkers: profile.toneMarkers,
          crawledAt: now,
          updatedAt: now,
        },
      });
    metadata.set("profile", profile);

    // ── Facts (cheap, batched) ──
    metadata.set("status", "extracting");
    const facts = await runFactExtractor({
      userId: payload.userId,
      projectId: payload.projectId,
      pages: crawl.pages,
    });
    const embeddings = await embedFacts(payload.userId, payload.projectId, facts.map((f) => f.fact));

    // Dedupe: skip facts >0.9 cosine to an existing fact, or to one already accepted this run.
    const existing = await db
      .select({ embedding: knowledgeItems.embedding })
      .from(knowledgeItems)
      .where(and(eq(knowledgeItems.projectId, payload.projectId), eq(knowledgeItems.userId, payload.userId)));
    const existingVecs = existing.map((e) => e.embedding).filter((v): v is number[] => Array.isArray(v));

    const accepted: { fact: (typeof facts)[number]; embedding: number[] }[] = [];
    for (let i = 0; i < facts.length; i++) {
      const emb = embeddings[i];
      const fact = facts[i];
      if (!emb || !fact) continue;
      const dup =
        existingVecs.some((v) => cosine(v, emb) > 0.9) ||
        accepted.some((a) => cosine(a.embedding, emb) > 0.9);
      if (!dup) accepted.push({ fact, embedding: emb });
    }

    if (accepted.length > 0) {
      await db.insert(knowledgeItems).values(
        accepted.map(({ fact, embedding }) => ({
          projectId: payload.projectId,
          userId: payload.userId,
          fact: fact.fact,
          category: fact.category,
          specificity: fact.specificity,
          sourceUrl: payload.url,
          sourceQuote: fact.sourceQuote,
          embedding,
        })),
      );
    }

    // thin_content: median specificity < 0.5 → onboarding will prompt for a brain dump.
    const specs = accepted.map((a) => a.fact.specificity).sort((x, y) => x - y);
    const median = specs.length ? (specs[Math.floor(specs.length / 2)] ?? 0) : 0;
    const thin = accepted.length === 0 || median < 0.5;
    if (thin) {
      await db.update(projects).set({ thinContent: true, updatedAt: new Date() }).where(eq(projects.id, payload.projectId));
      metadata.set("warning", "This site is light on specifics — add a brain dump later for stronger posts.");
    }

    metadata.set("factsExtracted", accepted.length);
    metadata.set("status", "done");
    logger.info("ingest complete", {
      projectId: payload.projectId,
      facts: accepted.length,
      median,
      thin,
    });
    return { ok: true as const, profile, factsExtracted: accepted.length };
  },
});
