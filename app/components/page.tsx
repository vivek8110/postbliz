"use client";

import React, { useState, useEffect } from "react";
import "./gallery.css";

type Theme = "auto" | "light" | "dark";

const palette: { group: string; note?: string; items: { n: string; h: string }[] }[] = [
  {
    group: "Ink & paper",
    items: [
      { n: "--ink", h: "#17191F" },
      { n: "--ink-soft", h: "#3A3D46" },
      { n: "--ink-muted", h: "#6A6D75" },
      { n: "--ink-faint", h: "#9B9DA4" },
      { n: "--paper", h: "#FCFCFA" },
      { n: "--paper-raised", h: "#FFFFFF" },
      { n: "--paper-sunken", h: "#F4F4F1" },
      { n: "--rule", h: "#E6E6E1" },
      { n: "--rule-strong", h: "#D2D2CB" },
    ],
  },
  {
    group: "Brand & highlighter",
    items: [
      { n: "--accent", h: "#2E3AE8" },
      { n: "--accent-hover", h: "#2530C4" },
      { n: "--accent-wash", h: "#EEF0FE" },
      { n: "--highlight", h: "#FFE566" },
      { n: "--highlight-edge", h: "#E8C93D" },
    ],
  },
  {
    group: "States & washes",
    note: "washes gap-filled in dark",
    items: [
      { n: "--queued", h: "#5B6BF0" },
      { n: "--queued-wash", h: "token" },
      { n: "--published", h: "#2F8F5B" },
      { n: "--published-wash", h: "token" },
      { n: "--held", h: "#C77700" },
      { n: "--held-wash", h: "token" },
      { n: "--failed", h: "#C63737" },
      { n: "--failed-wash", h: "token" },
    ],
  },
  {
    group: "Platforms — chips only",
    items: [
      { n: "--p-x", h: "#17191F" },
      { n: "--p-linkedin", h: "#0A66C2" },
      { n: "--p-reddit", h: "#FF4500" },
      { n: "--p-instagram", h: "#C13584" },
      { n: "--p-tiktok", h: "#010101" },
    ],
  },
];

const typeScale: { lbl: string; size: string; ls?: string; text: string }[] = [
  { lbl: "--text-3xl · 44", size: "var(--text-3xl)", ls: "-.02em", text: "It explains what you built" },
  { lbl: "--text-2xl · 30", size: "var(--text-2xl)", ls: "-.01em", text: "Page title" },
  { lbl: "--text-xl · 22", size: "var(--text-xl)", text: "Section heading" },
  { lbl: "--text-lg · 17", size: "var(--text-lg)", text: "Post content — the hero of the card." },
  { lbl: "--text-base · 15", size: "var(--text-base)", text: "UI default body text." },
  { lbl: "--text-sm · 13", size: "var(--text-sm)", text: "Labels and secondary copy." },
];

const spacing: [string, number][] = [
  ["--s-1", 4], ["--s-2", 8], ["--s-3", 12], ["--s-4", 16],
  ["--s-5", 24], ["--s-6", 32], ["--s-7", 48], ["--s-8", 64],
];

export default function ComponentGallery() {
  const [theme, setTheme] = useState<Theme>("auto");
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const el = document.documentElement;
    if (theme === "auto") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", theme);
    return () => el.removeAttribute("data-theme");
  }, [theme]);

  const toggle = (id: string) => setReviewed((r) => ({ ...r, [id]: !r[id] }));
  const count = Object.values(reviewed).filter(Boolean).length;

  const item = (id: string, title: string, tag: string, spec: React.ReactNode, demo: React.ReactNode) => (
    <section className={`g-item${reviewed[id] ? " is-done" : ""}`} id={id}>
      <div className="g-item-head">
        <h3>{title}</h3>
        <span className="g-tag">{tag}</span>
        <label className="g-review">
          <input type="checkbox" checked={!!reviewed[id]} onChange={() => toggle(id)} /> Reviewed
        </label>
      </div>
      <div className="g-spec">{spec}</div>
      <div className="g-demo">{demo}</div>
    </section>
  );

  const total = 14;

  return (
    <>
      <div className="g-topbar">
        <div className="g-brand">
          <strong>Postbliz — Component Gallery</strong>
          <span>Rendered from <span className="mono">design.md</span> · live in the app</span>
        </div>
        <div className="g-topbar-right">
          <div className="g-count">Reviewed <b>{count}</b>/{total}</div>
          <div className="g-theme" role="group" aria-label="Theme">
            {(["auto", "light", "dark"] as Theme[]).map((t) => (
              <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>
                {t[0]!.toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="g-shell">
        <nav className="g-nav" aria-label="Components">
          <div className="g-nav-h">Foundations</div>
          <a href="#f-palette">Colour palette</a>
          <a href="#f-type">Typography</a>
          <a href="#f-scale">Spacing · radius · shadow</a>
          <div className="g-nav-h">Components</div>
          <a href="#c-pill">Status pill</a>
          <a href="#c-chips">Chips</a>
          <a href="#c-btn">Buttons</a>
          <a href="#c-card">Post card</a>
          <a href="#c-rail">The Rail</a>
          <a href="#c-held">Held banner</a>
          <a href="#c-meter">Self-promo ratio meter</a>
          <a href="#c-know">Knowledge item</a>
          <div className="g-nav-h">Guidance</div>
          <a href="#g-copy">Copy rules</a>
          <a href="#g-motion">Motion</a>
          <a href="#g-screens">Screens</a>
        </nav>

        <main className="g-main">
          <div className="g-intro">
            <h1>Everything the design system prescribes, in one page.</h1>
            <p>
              Each block below is a component or foundation defined in <span className="mono">design.md</span>,
              rendered live in the app with real Geist. Tick <b>Reviewed</b> on any block to track sign-off —
              the counter up top keeps score.
            </p>
            <div className="g-note">
              <span>ℹ️</span>
              <div>
                One open decision: <b>design.md defines no dark-mode state washes</b>{" "}
                (queued/published/held/failed) — those are gap-filled for legibility here (see the palette),
                so you can decide the real values.
              </div>
            </div>
          </div>

          {/* ── FOUNDATIONS ── */}
          <div className="g-sec-h">Foundations</div>

          {item(
            "f-palette", "Colour palette", "tokens",
            <>Ink on paper. Accent <code>#2E3AE8</code> used sparingly. Highlighter yellow <code>--highlight</code> is <b>review-only</b>. Platform colours are for chips only, never large areas.</>,
            <div className="swatches">
              {palette.map((g) => (
                <React.Fragment key={g.group}>
                  <div className="swgroup-h">
                    {g.group}
                    {g.note && <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--ink-faint)" }}> · {g.note}</span>}
                  </div>
                  {g.items.map((it) => (
                    <div className="sw" key={it.n}>
                      <div className="chip" style={{ background: `var(${it.n})` }} />
                      <div className="meta">
                        <div className="name">{it.n}</div>
                        <div className={it.h === "token" ? "hex mono" : "hex"}>{it.h}</div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          )}

          {item(
            "f-type", "Typography", "type",
            <><b>Geist</b> for UI (400/500/600), <b>Geist Mono</b> for real data — timestamps, handles, counts, IDs. Post content is always ≥ <code>--text-lg</code>. Never centre body text.</>,
            <>
              {typeScale.map((t) => (
                <div className="type-row" key={t.lbl}>
                  <span className="lbl">{t.lbl}</span>
                  <span style={{ fontSize: t.size, letterSpacing: t.ls }}>{t.text}</span>
                </div>
              ))}
              <div className="type-row">
                <span className="lbl">--text-xs · 12</span>
                <span className="mono" style={{ fontSize: "var(--text-xs)" }}>09:07 · @handle · 213/280</span>
              </div>
              <div className="type-spec">
                <div><b>UI</b> <span className="mono" style={{ fontSize: 12 }}>--font-ui</span> — Geist</div>
                <div><b>Data</b> <span className="mono" style={{ fontSize: 12 }}>--font-mono</span> — Geist Mono</div>
                <div>Line-height <b>1.55</b> content · <b>1.4</b> UI</div>
              </div>
            </>
          )}

          {item(
            "f-scale", "Spacing · radius · shadow", "tokens",
            <>4px base, 8px rhythm. Flat by default — <b>shadow means "lifted", used sparingly.</b></>,
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {spacing.map(([n, px]) => (
                  <div className="scale-row" key={n}>
                    <span className="lbl">{n} {px}</span>
                    <span className="bar" style={{ width: px }} />
                  </div>
                ))}
              </div>
              <div className="rr">
                <div className="box"><div className="b" style={{ borderRadius: "var(--radius-sm)" }} /><span>--radius-sm 4</span></div>
                <div className="box"><div className="b" style={{ borderRadius: "var(--radius)" }} /><span>--radius 8</span></div>
                <div className="box"><div className="b" style={{ borderRadius: "var(--radius-lg)" }} /><span>--radius-lg 12</span></div>
                <div className="box sh"><div className="b" style={{ boxShadow: "var(--shadow-sm)" }} /><span>--shadow-sm</span></div>
                <div className="box sh"><div className="b" style={{ boxShadow: "var(--shadow)" }} /><span>--shadow</span></div>
              </div>
            </>
          )}

          {/* ── COMPONENTS ── */}
          <div className="g-sec-h">Components</div>

          {item(
            "c-pill", "Status pill", "component",
            <>Mono, 11px, uppercase, letter-spaced 0.04em, <code>--radius-sm</code>, state-wash background, state-colour text. <b>Never an icon alone.</b></>,
            <div className="row">
              <span className="pill queued">Queued</span>
              <span className="pill published">Published</span>
              <span className="pill held">Held</span>
              <span className="pill failed">Failed</span>
            </div>
          )}

          {item(
            "c-chips", "Chips", "component",
            <>Category chips label knowledge items. Platform chips use the platform colour — <b>chips only, never large areas.</b></>,
            <>
              <div className="row" style={{ marginBottom: 16 }}>
                {["feature", "benefit", "problem", "origin story", "technical detail", "social proof"].map((c) => (
                  <span className="chip-cat" key={c}>{c}</span>
                ))}
              </div>
              <div className="row">
                {[["X", "--p-x"], ["LinkedIn", "--p-linkedin"], ["Reddit", "--p-reddit"], ["Instagram", "--p-instagram"], ["TikTok", "--p-tiktok"]].map(([label, v]) => (
                  <span className="chip-plat" key={label} style={{ background: `var(${v})` }}>{label}</span>
                ))}
              </div>
            </>
          )}

          {item(
            "c-btn", "Buttons", "derived",
            <><b>Derived from tokens</b> — design.md doesn't spec buttons explicitly, but implies them (<code>[Reschedule]</code>, <code>[Edit]</code>). Flat, 1px, <code>--radius</code>. Labels say exactly what happens.</>,
            <div className="row">
              <button className="btn primary">Schedule post</button>
              <button className="btn secondary">Save draft</button>
              <button className="btn ghost">Cancel</button>
              <button className="btn danger">Delete</button>
            </div>
          )}

          {item(
            "c-card", "Post card", "the atom",
            <>1px <code>--rule</code> border, <code>--radius</code>, no shadow at rest. Left edge: 3px state-colour bar. Meta &amp; footer in mono. Content is the hero at <code>--text-lg</code>. <b>Needs-review → highlight wash behind the content only.</b></>,
            <>
              <div className="cardwrap">
                <div className="pcard published">
                  <div className="meta"><span className="avatar" /><span className="handle">@marcbuilds</span><span className="when">Tue 14 Jul · 09:07 · X</span></div>
                  <div className="body">Made our CSV import 6× faster this weekend. We were parsing the whole file into memory before validating a single row. Now it streams — a 40MB import that used to time out at 30s finishes in 4.</div>
                  <div className="foot"><span className="link">↳ postbliz.co/x7f2a</span><span className="count">213/280</span><span className="more">⋯</span></div>
                </div>
                <div className="pcard publishing">
                  <div className="meta"><span className="avatar" /><span className="handle">@marcbuilds</span><span className="when" style={{ color: "var(--accent)" }}>publishing now…</span></div>
                  <div className="body">The onboarding crawl now shows every fact as it's extracted, one line at a time. Watching it read your own changelog back to you is oddly satisfying.</div>
                  <div className="foot"><span className="link">↳ postbliz.co/a91k2</span><span className="count">178/280</span><span className="more">⋯</span></div>
                </div>
                <div className="pcard queued">
                  <div className="meta"><span className="avatar" /><span className="handle">Marc · LinkedIn</span><span className="when">Wed 15 Jul · 08:30</span></div>
                  <div className="body">Shipping a small thing every day beats shipping a big thing every quarter. Here's what streaming CSV imports taught me about scope.</div>
                  <div className="foot"><span className="link">↳ in first comment</span><span className="count mono">queued</span><span className="more">⋯</span></div>
                </div>
                <div className="pcard queued review">
                  <div className="meta"><span className="avatar" /><span className="handle">@marcbuilds</span><span className="when">Wed 15 Jul · 12:00 · X</span></div>
                  <div className="body">Hot take: most "AI writing tools" fail because they generate from nothing. If a post can't trace back to a real fact about your product, it reads as slop — and everyone can tell.</div>
                  <div className="foot"><span style={{ color: "var(--held)" }}>⚑ needs review</span><span className="count">241/280</span><span className="more">⋯</span></div>
                </div>
              </div>
              <p style={{ margin: "16px 0 0", fontSize: "var(--text-sm)", color: "var(--ink-muted)" }}>
                Held cards get their own break-the-rail treatment — see <a href="#c-rail">The Rail</a> and <a href="#c-held">Held banner</a>.
              </p>
            </>
          )}

          {item(
            "c-rail", "The Rail", "signature",
            <>The one bold move. 1px <code>--rule</code> spine, 8px ticks, mono timestamps. The now-line is solid <code>--accent</code>, 2px, full width. <b>Held posts break the rail — shifted left with a gap.</b></>,
            <div className="rail">
              <div className="rail-spine" />
              <div className="rail-row"><div className="rail-time">09:00</div><span className="rail-tick" /><div className="rail-card"><span className="t">X · published</span><br />CSV import is 6× faster</div></div>
              <div className="rail-row"><div className="rail-time">11:30</div><span className="rail-tick" /><div className="rail-card"><span className="t">X · publishing</span><br />Onboarding crawl shows every fact</div></div>
              <div className="rail-row now"><div className="rail-nowline" /><span className="rail-nowlabel">NOW · 12:14</span><div className="rail-time">&nbsp;</div><div className="rail-card" style={{ marginTop: 14 }}>LinkedIn · queued 12:30</div></div>
              <div className="rail-row held"><div className="rail-time">14:00</div><span className="rail-connector" /><span className="rail-gap" /><div className="rail-card"><span className="t" style={{ color: "var(--held)" }}>Reddit · HELD</span><br />r/SaaS — karma check</div></div>
              <div className="rail-row"><div className="rail-time">17:00</div><span className="rail-tick" /><div className="rail-card"><span className="t">X · queued</span><br />Hot take on AI slop</div></div>
            </div>
          )}

          {item(
            "c-held", "Held banner", "non-happy-path",
            <>The most important non-happy-path component. <code>--held-wash</code> background, 1px <code>--held</code> at 25%. <b>Never red — this isn't an error, it's the product working.</b></>,
            <div className="held-banner">
              <div className="hb-title">⏸ Held — r/SaaS</div>
              <p className="hb-why">Your Reddit account has 34 karma. r/SaaS filters posts from accounts under 50.</p>
              <p className="hb-fix">Comment on a few threads in r/SaaS this week. We'll check again before the next slot.</p>
              <div className="hb-actions">
                <button className="btn secondary">Reschedule</button>
                <button className="btn secondary">Post elsewhere</button>
                <button className="btn ghost">Edit</button>
              </div>
            </div>
          )}

          {item(
            "c-meter", "Self-promo ratio meter", "reddit · trust",
            <>Reddit only. Value posts (<code>--published</code>) vs promo posts (<code>--held</code>), with a marker at the 20% threshold. <b>A trust feature, not a gauge.</b></>,
            <div className="meter">
              <div className="track"><div className="promo" style={{ width: "20%" }} /><div className="thresh" style={{ right: "20%" }}><span>20%</span></div></div>
              <div className="lbl"><span className="val">8 value</span><span className="mono">2 / 10 promotional</span><span className="pro">2 promo</span></div>
            </div>
          )}

          {item(
            "c-know", "Knowledge item", "component",
            <>Fact in 15px <code>--ink</code>. Below: source favicon + domain, specificity as a 5-segment mono bar, category chip. <b>Hover reveals the source quote in a <code>--paper-sunken</code> well.</b></>,
            <div className="kitem">
              <div className="fact">CSV import streams rows instead of buffering the whole file — a 40MB import finishes in 4s, down from a 30s timeout.</div>
              <div className="kmeta">
                <span className="src"><span className="fav" />github.com/marc/app · changelog</span>
                <span className="spec-bar" title="specificity 4/5">
                  {[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < 4 ? "on" : ""} />)}
                </span>
                <span className="chip-cat">feature</span>
              </div>
              <div className="quote">"Refactored the importer to stream + validate per-row. 40MB test file: 30s timeout → 4.1s. No memory spike."</div>
              <div className="hint">Hover to reveal the source quote ↑</div>
            </div>
          )}

          {/* ── GUIDANCE ── */}
          <div className="g-sec-h">Guidance</div>

          {item(
            "g-copy", "Copy rules", "words are design",
            <>Voice: direct, technical, unhyped. Talk to a peer who ships code. <b>Never sell inside the product</b> — they already bought.</>,
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="copytable">
                  <thead><tr><th>Rule</th><th className="no">✕ Never</th><th className="yes">✓ Instead</th></tr></thead>
                  <tbody>
                    <tr><td>Active, specific verbs</td><td className="mono">Submit</td><td className="mono">Schedule post</td></tr>
                    <tr><td>Same word through a flow</td><td className="mono">Publish → Content submitted</td><td className="mono">Publish → Published</td></tr>
                    <tr><td>Errors explain &amp; instruct</td><td>Something went wrong</td><td>X rejected this as a duplicate. Edit the text and try again</td></tr>
                    <tr><td>Errors never apologise</td><td>Sorry! We couldn't post</td><td>Post held. LinkedIn needs re-authorisation</td></tr>
                    <tr><td>Empty states invite action</td><td>No posts yet</td><td>Nothing queued. Add a changelog and we'll draft from it</td></tr>
                    <tr><td>No system vocabulary</td><td>OAuth token expired</td><td>LinkedIn needs reconnecting</td></tr>
                    <tr><td>Numbers over adjectives</td><td>Great engagement!</td><td>47 clicks this week</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="banned">
                <b>Never in the UI:</b>{" "}
                {["leverage", "seamless", "effortless", "unlock", "empower", "supercharge", "game-changer", "AI-powered"].map((w) => (
                  <React.Fragment key={w}><code>{w}</code>{" "}</React.Fragment>
                ))}
                · no exclamation marks in system messages.
              </p>
            </>
          )}

          {item(
            "g-motion", "Motion", "sparing",
            <>Over-animation is the clearest AI-design tell. <code>prefers-reduced-motion</code> respected everywhere.</>,
            <ul className="g-list">
              <li><b>The one moment</b> — the onboarding crawl. Show real progress: pages found, facts extracted, counter ticking. Never a spinner.</li>
              <li><b>Now-line</b> drifts down the rail in real time (CSS transform, 60s tick).</li>
              <li><b>State change</b> — 200ms colour transition, no bounce.</li>
              <li><b>Card enter</b> — 150ms fade + 4px rise. That's all.</li>
            </ul>
          )}

          {item(
            "g-screens", "Screens", "where they live",
            <>The components above assemble into six screens.</>,
            <ul className="g-list">
              <li><b>Onboarding</b> — URL → live crawl → brand-profile confirm → connect channels → first 3 posts. Under 60 seconds to a previewable post.</li>
              <li><b>Queue (home)</b> — the rail. Filters by channel, needs-review highlighted. Where users live.</li>
              <li><b>Composer</b> — editor left, live platform preview right, mono char count, provenance sidebar.</li>
              <li><b>Knowledge</b> — the fact library. Searchable, filterable by source and specificity.</li>
              <li><b>Channels</b> — connected accounts, health, cadence, Reddit sub list with risk ratings.</li>
              <li><b>Settings</b> — plan, usage against limits, billing, projects.</li>
            </ul>
          )}
        </main>
      </div>
    </>
  );
}
