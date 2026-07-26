import Firecrawl from "@mendable/firecrawl-js";

export class CrawlError extends Error {
  constructor(public userMessage: string) {
    super(userMessage);
    this.name = "CrawlError";
  }
}

export type CrawlResult = { pages: string[]; wordCount: number };

// Crawl a site's homepage + up to `limit-1` internal pages, return page markdown.
// All failure modes become plain-language messages — never a stack trace to the user.
export async function crawlSite(url: string, limit = 10): Promise<CrawlResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new CrawlError("Crawling isn't configured yet (missing Firecrawl API key).");

  const fc = new Firecrawl({ apiKey });
  let data: unknown[];
  try {
    const res = (await fc.crawl(url, {
      limit,
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
    })) as { data?: unknown[]; documents?: unknown[] };
    data = res?.data ?? res?.documents ?? [];
  } catch (e) {
    const msg = (e as Error)?.message ?? "";
    if (/timeout|timed out/i.test(msg)) {
      throw new CrawlError("The crawl timed out — the site was slow to respond. Try again in a minute.");
    }
    throw new CrawlError(`We couldn't reach ${url}. Check the URL is correct and publicly reachable.`);
  }

  const pages = data
    .map((p) => (p as { markdown?: string })?.markdown)
    .filter((m): m is string => typeof m === "string" && m.length > 0);

  if (pages.length === 0) {
    throw new CrawlError(
      `We reached ${url} but found no readable content. If it's a JavaScript-only app, there may be nothing to crawl — try a docs or marketing URL instead.`,
    );
  }

  const wordCount = pages.join(" ").split(/\s+/).filter(Boolean).length;
  return { pages, wordCount };
}
