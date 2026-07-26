import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, a stray lockfile
  // higher up the tree (e.g. ~/package-lock.json) makes Next infer the wrong
  // root and warn on every start.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
