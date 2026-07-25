import { defineConfig } from "@trigger.dev/sdk";

// Trigger.dev v4. All scheduling, publishing, generation runs here — API routes
// only enqueue (see lib/jobs/enqueue.ts). `project` is the ref from
// cloud.trigger.dev → your project → Settings; it is not a secret.
export default defineConfig({
  project: "proj_hyxeiynoubcqebfvoppe",
  dirs: ["./trigger"],
  runtime: "node",
  logLevel: "info",
  // Trigger bills per compute-second — keep tasks short, use `wait`/`delay`,
  // never sleep. Cap so a hung task can't run away with the bill.
  maxDuration: 300,
});
