import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createProject } from "./actions";
import { TimezoneField } from "./timezone-field";

const input =
  "rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const label = "flex flex-col gap-1 text-sm text-ink-soft";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-md rounded-lg border border-rule bg-paper-raised p-6">
      <h1 className="text-xl font-semibold tracking-tight text-ink">Create your project</h1>
      <p className="mt-1 text-sm text-ink-muted">One product you want to promote.</p>

      <form action={createProject} className="mt-5 flex flex-col gap-3">
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
    </div>
  );
}
