"use client";

import Link from "next/link";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

type Profile = {
  whatItDoes: string;
  whoItsFor: string;
  problemSolved: string;
  category: string | null;
  competitors: string[];
  vocabulary: string[];
  avoidTerms: string[];
  toneMarkers: string[];
};

type Meta = {
  status?: string;
  url?: string;
  pagesFound?: number;
  error?: string;
  warning?: string;
  profile?: Profile;
};

function Card({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-lg rounded-lg border border-rule bg-paper-raised p-6">{children}</div>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-rule py-3 last:border-0">
      <div className="font-mono text-xs uppercase tracking-wide text-ink-faint">{label}</div>
      <div className="mt-1 text-sm text-ink">{value}</div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items?.length) return <span className="text-ink-faint">—</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="rounded-sm border border-rule bg-paper-sunken px-2 py-0.5 text-xs text-ink-soft">{t}</span>
      ))}
    </span>
  );
}

export function CrawlProgress({ runId, accessToken }: { runId: string; accessToken: string }) {
  const { run, error } = useRealtimeRun(runId, { accessToken });
  const md = (run?.metadata ?? {}) as Meta;
  const status = md.status ?? "starting";

  if (error) {
    return (
      <Card>
        <p className="text-sm text-ink-soft">
          Lost the connection to the crawl. It may still be running —{" "}
          <Link href="/app" className="text-accent hover:underline">go to the app</Link>.
        </p>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Couldn&apos;t read that site</h1>
        <p className="mt-2 text-sm text-ink-soft">{md.error}</p>
        <Link
          href="/new"
          className="mt-5 inline-block rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Try another URL
        </Link>
      </Card>
    );
  }

  if (status === "done" && md.profile) {
    const p = md.profile;
    return (
      <Card>
        <div className="font-mono text-xs uppercase tracking-wide text-published">✓ Done</div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">Here&apos;s what we understood</h1>
        <p className="mt-1 text-sm text-ink-muted">Everything here is editable later — check it&apos;s right.</p>
        <div className="mt-4">
          <Row label="What it does" value={p.whatItDoes} />
          <Row label="Who it's for" value={p.whoItsFor} />
          <Row label="Problem solved" value={p.problemSolved} />
          <Row label="Category" value={p.category ?? "—"} />
          <Row label="Vocabulary" value={<Chips items={p.vocabulary} />} />
          <Row label="Tone" value={<Chips items={p.toneMarkers} />} />
          {p.competitors.length > 0 && <Row label="Competitors" value={<Chips items={p.competitors} />} />}
        </div>
        {md.warning && <p className="mt-3 rounded-sm bg-held-wash px-3 py-2 text-sm text-held">{md.warning}</p>}
        <Link
          href="/app"
          className="mt-5 inline-block rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Continue
        </Link>
      </Card>
    );
  }

  const label =
    status === "analyzing"
      ? "Understanding what you built…"
      : status === "crawling"
        ? "Reading your site…"
        : "Starting…";

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
        <h1 className="text-xl font-semibold tracking-tight text-ink">{label}</h1>
      </div>
      {md.url && <p className="mt-2 font-mono text-xs text-ink-muted">{md.url}</p>}
      {typeof md.pagesFound === "number" && (
        <p className="mt-3 text-sm text-ink-soft">{md.pagesFound} pages found</p>
      )}
      <p className="mt-4 text-xs text-ink-faint">This usually takes 20–40 seconds. You can watch it work.</p>
    </Card>
  );
}
