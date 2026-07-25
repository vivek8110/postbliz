import type { ErrorEvent } from "@sentry/nextjs";

// Sentry beforeSend scrubber. This repo is public and we hold OAuth tokens and
// API keys — nothing token-shaped may ever leave in an error report. Redacts
// values under secret-ish keys and any string matching a known secret pattern,
// recursively, across request data, extra, contexts, breadcrumbs, and messages.

const SECRET_KEY = /(token|secret|password|passwd|api[-_]?key|authorization|cookie|encryption[-_]?key|client[-_]?secret|dsn)/i;

const SECRET_VALUE = new RegExp(
  [
    "tr_[a-z]+_[A-Za-z0-9]+", // trigger.dev
    "sk-[A-Za-z0-9-]{10,}", // openai-style
    "phc_[A-Za-z0-9]{20,}", // posthog
    "whsec_[A-Za-z0-9]+", // webhook secrets
    "re_[A-Za-z0-9]{10,}", // resend
    "fc-[A-Za-z0-9]{10,}", // firecrawl
    "Bearer\\s+[A-Za-z0-9._-]+",
    "eyJ[A-Za-z0-9._-]{20,}", // JWTs
    "postgres(?:ql)?://[^\\s\"']+", // connection strings
  ].join("|"),
  "gi",
);

const REDACTED = "[redacted]";

function scrubValue(v: unknown): unknown {
  if (typeof v === "string") return v.replace(SECRET_VALUE, REDACTED);
  if (Array.isArray(v)) return v.map(scrubValue);
  if (v && typeof v === "object") return scrubObject(v as Record<string, unknown>);
  return v;
}

function scrubObject(o: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(o)) {
    out[k] = SECRET_KEY.test(k) ? REDACTED : scrubValue(val);
  }
  return out;
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  try {
    if (event.request?.headers) event.request.headers = scrubObject(event.request.headers) as Record<string, string>;
    if (event.request?.cookies) event.request.cookies = REDACTED as never;
    if (event.request?.query_string) event.request.query_string = scrubValue(event.request.query_string) as never;
    if (event.extra) event.extra = scrubObject(event.extra) as typeof event.extra;
    if (event.contexts) event.contexts = scrubObject(event.contexts) as typeof event.contexts;
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((b) => ({
        ...b,
        message: typeof b.message === "string" ? (scrubValue(b.message) as string) : b.message,
        data: b.data ? scrubObject(b.data) : b.data,
      }));
    }
    if (event.exception?.values) {
      for (const ex of event.exception.values) {
        if (typeof ex.value === "string") ex.value = scrubValue(ex.value) as string;
      }
    }
    if (typeof event.message === "string") event.message = scrubValue(event.message) as string;
  } catch {
    // never let scrubbing throw and drop the report entirely
  }
  return event;
}
