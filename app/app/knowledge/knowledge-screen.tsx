"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteFact, updateFact } from "./actions";

type Fact = {
  id: string;
  fact: string;
  category: string;
  specificity: number;
  sourceUrl: string | null;
  sourceQuote: string | null;
};
type Brand = { whatItDoes: string; whoItsFor: string; category: string | null; vocabulary: string[] } | null;

function domainOf(url: string | null): string {
  if (!url) return "brain dump";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function SpecBar({ value }: { value: number }) {
  const on = Math.max(0, Math.min(5, Math.round(value * 5)));
  return (
    <span className="inline-flex gap-0.5" title={`specificity ${value.toFixed(2)}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={`h-1.5 w-3 rounded-sm ${i < on ? "bg-accent" : "bg-rule-strong"}`} />
      ))}
    </span>
  );
}

function KnowledgeItem({ f }: { f: Fact }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(f.fact);
  const [pending, start] = useTransition();

  return (
    <li className="group rounded-lg border border-rule bg-paper-raised p-4">
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => start(async () => { await updateFact(f.id, draft); setEditing(false); })}
              disabled={pending}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              Save
            </button>
            <button
              onClick={() => { setDraft(f.fact); setEditing(false); }}
              className="rounded-lg px-3 py-1.5 text-xs text-ink-soft hover:bg-paper-sunken"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[0.9375rem] text-ink">{f.fact}</div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-ink-muted">{domainOf(f.sourceUrl)}</span>
        <SpecBar value={f.specificity} />
        <span className="rounded-sm border border-rule bg-paper-sunken px-2 py-0.5 text-xs text-ink-soft">
          {f.category.replace(/_/g, " ")}
        </span>
        {!editing && (
          <span className="ml-auto flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-ink">Edit</button>
            <button
              onClick={() => start(async () => { await deleteFact(f.id); })}
              disabled={pending}
              className="text-xs text-failed hover:underline disabled:opacity-60"
            >
              Delete
            </button>
          </span>
        )}
      </div>

      {f.sourceQuote && (
        <div className="mt-2 hidden rounded-sm border-l-2 border-rule-strong bg-paper-sunken px-3 py-2 text-sm text-ink-soft group-hover:block">
          &ldquo;{f.sourceQuote}&rdquo;
        </div>
      )}
    </li>
  );
}

export function KnowledgeScreen({ facts, brand }: { facts: Fact[]; brand: Brand }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"spec-desc" | "spec-asc">("spec-desc");

  const categories = useMemo(
    () => Array.from(new Set(facts.map((f) => f.category))).sort(),
    [facts],
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = facts.filter(
      (f) =>
        (cat === "all" || f.category === cat) &&
        (needle === "" || f.fact.toLowerCase().includes(needle) || (f.sourceQuote ?? "").toLowerCase().includes(needle)),
    );
    list = [...list].sort((a, b) =>
      sort === "spec-desc" ? b.specificity - a.specificity : a.specificity - b.specificity,
    );
    return list;
  }, [facts, q, cat, sort]);

  const select =
    "rounded-lg border border-rule bg-paper-raised px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Knowledge</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Everything Postbliz knows about your product. Every post traces back to one of these — edit or delete
        anything that&apos;s wrong.
      </p>

      {brand && (
        <div className="mt-4 rounded-lg border border-rule bg-paper-raised p-4">
          <div className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            About{brand.category ? ` · ${brand.category}` : ""}
          </div>
          <p className="mt-1 text-sm text-ink">{brand.whatItDoes}</p>
          <p className="mt-1 text-sm text-ink-muted">For {brand.whoItsFor}</p>
          {brand.vocabulary?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {brand.vocabulary.map((v) => (
                <span key={v} className="rounded-sm border border-rule bg-paper-sunken px-2 py-0.5 text-xs text-ink-soft">{v}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search facts…"
          className="flex-1 rounded-lg border border-rule bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={select}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={select}>
          <option value="spec-desc">Most specific</option>
          <option value="spec-asc">Least specific</option>
        </select>
      </div>

      <div className="mt-2 font-mono text-xs text-ink-muted">
        {shown.length} of {facts.length} facts
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {shown.map((f) => (
          <KnowledgeItem key={f.id} f={f} />
        ))}
      </ul>
    </div>
  );
}
