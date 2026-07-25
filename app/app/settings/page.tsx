import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const row = "flex items-center justify-between border-b border-rule py-3 text-sm";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
      <div className="mt-4">
        <div className={row}>
          <span className="text-ink-muted">Account</span>
          <span className="font-mono text-ink">{session.user.email}</span>
        </div>
        <div className={row}>
          <span className="text-ink-muted">Plan</span>
          <span className="text-ink">Trial</span>
        </div>
        <div className={row}>
          <span className="text-ink-muted">Usage this month</span>
          <span className="font-mono text-ink">0 posts published</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-faint">Billing, plan limits, and project management arrive in a later phase.</p>
    </div>
  );
}
