import type { ReactNode } from "react";

// Empty states are invitations to act, not "no data found" (design.md copy rules).
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-muted">{children}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
