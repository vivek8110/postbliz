import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { scoped } from "@/db/scoped";

export default async function AppHome() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const rows = await db
    .select()
    .from(projects)
    .where(scoped(projects.userId, session.user.id));

  // First sign-in — no project yet. Send them to create one.
  if (rows.length === 0) redirect("/app/new");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Your projects</h1>
        <Link href="/app/new" className="text-sm text-accent hover:underline">+ New project</Link>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {rows.map((p) => (
          <li key={p.id} className="rounded-lg border border-rule bg-paper-raised px-4 py-3">
            <div className="font-medium text-ink">{p.name}</div>
            <div className="font-mono text-xs text-ink-muted">{p.url}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
