import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { scoped } from "@/db/scoped";
import { AppNav } from "./nav";
import { ProjectSwitcher } from "./project-switcher";
import { SignOutButton } from "./sign-out-button";

// The real auth gate. Also loads the user's projects for the switcher and
// bounces first-time users (no project) to onboarding at /new.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const rows = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(scoped(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt));
  if (rows.length === 0) redirect("/new");

  const cookieStore = await cookies();
  const activeId = cookieStore.get("pb_project")?.value;
  const active = rows.find((p) => p.id === activeId) ?? rows[0]!;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-rule">
        <div className="border-b border-rule px-4 py-4">
          <span className="font-semibold tracking-tight text-ink">Postbliz</span>
        </div>
        <AppNav />
        <div className="mt-auto border-t border-rule p-3">
          <SignOutButton />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-rule px-6 py-3">
          <ProjectSwitcher projects={rows} activeId={active.id} />
          <span className="hidden font-mono text-xs text-ink-muted sm:inline">{session.user.email}</span>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
