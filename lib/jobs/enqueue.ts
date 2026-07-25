import { type Task } from "@trigger.dev/sdk";

// The ONLY way app code (routes, server actions) starts background work.
// Hard architecture rule: API routes never call third parties — they validate,
// enqueue, and return. Tasks execute. This thin wrapper over Trigger.dev's
// `task.trigger` keeps the enqueue seam explicit (and swappable) so no route
// ever reaches for `.trigger` directly.
export function enqueue<TPayload, TOutput>(
  job: Task<string, TPayload, TOutput>,
  payload: TPayload,
  options?: Parameters<Task<string, TPayload, TOutput>["trigger"]>[1],
) {
  return job.trigger(payload, options);
}
