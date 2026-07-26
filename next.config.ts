import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, a stray lockfile
  // higher up the tree (e.g. ~/package-lock.json) makes Next infer the wrong
  // root and warn on every start.
  turbopack: {
    root: __dirname,
  },
};

// withSentryConfig wires Sentry's server instrumentation correctly under
// Turbopack (externalises require-in-the-middle / import-in-the-middle).
// Source-map upload is disabled — no auth token yet; add it later.
export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: true },
});
