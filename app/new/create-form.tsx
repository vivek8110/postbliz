"use client";

import { createProject } from "./actions";
import { TimezoneField } from "./timezone-field";
import { ANALYTICS, capture } from "@/lib/observability/analytics";

const input =
  "rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const label = "flex flex-col gap-1 text-sm text-ink-soft";

export function CreateProjectForm({ error }: { error?: string }) {
  return (
    <form
      action={createProject}
      onSubmit={() => capture(ANALYTICS.urlEntered)}
      className="mt-5 flex flex-col gap-3"
    >
      <label className={label}>
        Name
        <input name="name" required placeholder="Postbliz" className={input} />
      </label>
      <label className={label}>
        Product URL
        <input name="url" type="url" required placeholder="https://postbliz.co" className={input} />
      </label>
      <label className={label}>
        Timezone
        <TimezoneField className={input} />
      </label>
      {error === "missing" && <p className="text-sm text-failed">Name and product URL are required.</p>}
      <button type="submit" className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover">
        Create project
      </button>
    </form>
  );
}
