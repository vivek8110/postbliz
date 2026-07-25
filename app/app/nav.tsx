"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app/queue", label: "Queue" },
  { href: "/app/knowledge", label: "Knowledge" },
  { href: "/app/channels", label: "Channels" },
  { href: "/app/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`rounded-lg px-3 py-2 text-sm ${
              active ? "bg-accent-wash font-medium text-accent" : "text-ink-soft hover:bg-paper-sunken"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
