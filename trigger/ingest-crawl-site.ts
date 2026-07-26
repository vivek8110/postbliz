import { task, metadata, logger } from "@trigger.dev/sdk";
import { crawlSite, CrawlError } from "../lib/crawl/firecrawl";
import { runBrandAnalyst } from "../lib/agents/brand-analyst";
import { db } from "../db";
import { brandProfiles } from "../db/schema";

// ingest.crawl-site — Firecrawl the site, run the Brand Analyst, write the brand
// profile. Streams progress via run metadata (the onboarding "watch it work"
// moment). Fact extraction is added in Task 1.2.
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
    if (crawl.wordCount < 500) {
      metadata.set("warning", "This site is light on content — a brain dump later will make for stronger posts.");
    }

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
    metadata.set("status", "done");
    logger.info("brand profile written", { projectId: payload.projectId, category: profile.category });
    return { ok: true as const, profile };
  },
});
