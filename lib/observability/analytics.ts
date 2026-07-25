import posthog from "posthog-js";

// The activation funnel (growth.md). Stubbed in Phase 0: `signup` and
// `urlEntered` fire now; the rest are defined here and wired as their features
// land in later phases. Use these constants everywhere — never raw strings.
export const ANALYTICS = {
  signup: "signup",
  urlEntered: "url_entered",
  firstPostGenerated: "first_post_generated",
  channelConnected: "channel_connected",
  firstPostPublished: "first_post_published",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS)[keyof typeof ANALYTICS];

export function capture(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}
