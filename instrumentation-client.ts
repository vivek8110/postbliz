import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/observability/scrub";

// The DSN is a public client key (safe to expose); it must be NEXT_PUBLIC_ to
// reach the browser. Set NEXT_PUBLIC_SENTRY_DSN to the same value as SENTRY_DSN.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
  beforeSend: scrubEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
