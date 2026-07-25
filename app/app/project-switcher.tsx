"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type P = { id: string; name: string };

export function ProjectSwitcher({ projects, activeId }: { projects: P[]; activeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = projects.find((p) => p.id === activeId) ?? projects[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(id: string) {
    document.cookie = `pb_project=${id}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-rule px-3 py-1.5 text-sm text-ink hover:bg-paper-sunken"
      >
        <span className="font-medium">{active?.name ?? "Select project"}</span>
        <span className="text-ink-faint">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-rule bg-paper-raised py-1 shadow-[var(--shadow)]">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p.id)}
              className={`block w-full px-3 py-1.5 text-left text-sm ${
                p.id === active?.id ? "text-accent" : "text-ink-soft hover:bg-paper-sunken"
              }`}
            >
              {p.name}
            </button>
          ))}
          <div className="my-1 h-px bg-rule" />
          <Link href="/new" className="block px-3 py-1.5 text-sm text-accent hover:bg-paper-sunken">
            + New project
          </Link>
        </div>
      )}
    </div>
  );
}
