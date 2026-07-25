import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

// The real auth gate. Middleware only does an optimistic cookie check; this
// validates the session against the DB for everything under /app.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-rule px-6 py-3">
        <span className="font-semibold tracking-tight text-ink">Postbliz</span>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-ink-muted sm:inline">{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
