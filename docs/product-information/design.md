# Design System

For any UI work, and as a brief you can paste into Claude Design. Sections marked **📋 BRIEF** are
written to be copied directly.

---

## Direction: the proof sheet

Postbliz is not a marketing suite. It's a **proofing desk** — where writing gets set, checked, and
released. That world (typesetting, proofs, press runs, the highlighter on a page under review) gives
us a specific visual language that no other tool in this category uses.

Three consequences:

1. **Text is the material.** Post content is the largest, most carefully set type on every screen.
   Chrome recedes. If a screen has more UI than content, it's wrong.
2. **State is structural, not decorative.** Queued, published, held — these are positions in a
   process, so they're expressed through *placement and alignment*, not just colour chips.
3. **Review is physical.** Something needing attention gets a highlighter wash, the way you'd mark a
   page. Used nowhere else, so it always means one thing.

**What we're not:** not a glossy SaaS gradient landing page, not a dark developer terminal, not a
cream-and-serif editorial site. Our user is allergic to marketing polish — that allergy is why
they're here.

### Signature element: The Rail

The queue is the product, so the queue view carries the one memorable idea.

A single vertical rule runs down the left of the queue. Each scheduled post is a tick on it, spaced
proportionally by time. A **now marker** — a solid horizontal line with a mono timestamp — sits at the
current moment and moves down through the day.

Posts sit flush against the rail. **A held post breaks alignment**, nudging 24px left with a visible
gap in the rail where it should have been. You can see at a glance that something has fallen out of
the flow, before reading a single word.

Spend the boldness here. Everything else stays quiet.

---

## Tokens

```css
:root {
  /* ── ink & paper ─────────────────────────────── */
  --ink:            #17191F;   /* primary text, dark surfaces */
  --ink-soft:       #3A3D46;   /* secondary text */
  --ink-muted:      #6A6D75;   /* tertiary, metadata */
  --ink-faint:      #9B9DA4;   /* placeholders, disabled */

  --paper:          #FCFCFA;   /* page background */
  --paper-raised:   #FFFFFF;   /* cards, inputs */
  --paper-sunken:   #F4F4F1;   /* wells, code blocks */
  --rule:           #E6E6E1;   /* borders, dividers, the rail */
  --rule-strong:    #D2D2CB;   /* emphasised borders */

  /* ── brand ───────────────────────────────────── */
  --accent:         #2E3AE8;   /* electric ink blue */
  --accent-hover:   #2530C4;
  --accent-wash:    #EEF0FE;   /* tinted background */

  /* ── the highlighter — review only, nowhere else ─ */
  --highlight:      #FFE566;
  --highlight-edge: #E8C93D;

  /* ── states ──────────────────────────────────── */
  --queued:         #5B6BF0;   --queued-wash:    #EEF0FE;
  --published:      #2F8F5B;   --published-wash: #E8F5EE;
  --held:           #C77700;   --held-wash:      #FDF3E3;
  --failed:         #C63737;   --failed-wash:    #FCEDED;

  /* ── platforms (for chips only, never large areas) ─ */
  --p-x:         #17191F;
  --p-linkedin:  #0A66C2;
  --p-reddit:    #FF4500;
  --p-instagram: #C13584;
  --p-tiktok:    #010101;

  /* ── type ────────────────────────────────────── */
  --font-ui:   "Instrument Sans", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --text-xs:   0.75rem;   /* 12 — mono metadata */
  --text-sm:   0.8125rem; /* 13 — labels */
  --text-base: 0.9375rem; /* 15 — UI default */
  --text-lg:   1.0625rem; /* 17 — post content. Deliberately larger than chrome */
  --text-xl:   1.375rem;  /* 22 — section headings */
  --text-2xl:  1.875rem;  /* 30 — page titles */
  --text-3xl:  2.75rem;   /* 44 — marketing only */

  /* ── space: 4px base, 8px rhythm ─────────────── */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-5: 24px;  --s-6: 32px;  --s-7: 48px;  --s-8: 64px;

  --radius-sm: 4px;
  --radius:    8px;
  --radius-lg: 12px;

  /* flat by default. shadow means "lifted", used sparingly */
  --shadow-sm: 0 1px 2px rgba(23,25,31,.05);
  --shadow:    0 2px 8px rgba(23,25,31,.07);
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #EDEDEA; --ink-soft: #B9BAC2; --ink-muted: #8A8C95; --ink-faint: #5E606A;
    --paper: #131519; --paper-raised: #1B1E24; --paper-sunken: #0E1013;
    --rule: #292C34; --rule-strong: #383C46;
    --accent: #7B85FF; --accent-hover: #949CFF; --accent-wash: #1C2036;
    --highlight: #F5D93B; --highlight-edge: #C9AF28;
  }
}
```

### Typography

**Instrument Sans** (UI) — geometric with enough eccentricity to not read as Inter. Weights 400/500/600.
**JetBrains Mono** (data) — timestamps, handles, char counts, platform labels, IDs, the rail's time
markers. Mono is the developer vernacular; using it for real data rather than decoration is the point.

Both free on Google Fonts.

**Post previews use platform-native stacks** — the preview must look like the platform, not like
Postbliz. `-apple-system` for X, `system-ui` for LinkedIn, `IBM Plex Sans`/system for Reddit.

Rules: never centre body text · line-height 1.55 for content, 1.4 for UI · never letter-space
lowercase text · content type is always ≥ `--text-lg`.

---

## Components

### Post card
The atom of the product.

```
┌─────────────────────────────────────────────┐
│ ●  @handle          Tue 14 Jul · 09:07  [X] │  mono meta, 12px, --ink-muted
├─────────────────────────────────────────────┤
│                                             │
│  Post content, 17px, generous line-height,  │  ← the hero of the card
│  set as if it matters. Because it does.     │
│                                             │
├─────────────────────────────────────────────┤
│ ↳ postbliz.co/x7f2a          213/280   ⋯    │  link-reply indicator + count
└─────────────────────────────────────────────┘
```

- 1px `--rule` border, `--radius`, no shadow at rest
- Left edge: 3px state colour bar
- Needs review → `--highlight` wash behind the content area only
- Held → the whole card shifts 24px left off the rail

### The Rail

```
   09:00 ┼──── ┌──────────────┐
         │     │ post card    │
         │     └──────────────┘
   11:30 ┼──── ┌──────────────┐
         │     │ post card    │
──NOW────┼─────└──────────────┘────────── solid --accent line, mono timestamp
         ┊
         ┊  ← gap in rail
   14:00 ╎  ┌──────────────┐
         ╎  │ HELD         │  ← shifted left, dashed connector
         │  └──────────────┘
   17:00 ┼──── ┌──────────────┐
```

1px `--rule`. Ticks are 8px horizontal marks. Times in mono, 12px. The now-line is solid `--accent`,
2px, spanning full width. Held posts break the rail — that's the whole idea.

### Status pill
Mono, 11px, uppercase, letter-spaced 0.04em, `--radius-sm`, state wash background, state colour text.
`QUEUED` · `PUBLISHED` · `HELD` · `FAILED`. Never an icon alone.

### Held banner
The most important non-happy-path component in the product.

```
┌─────────────────────────────────────────────────────┐
│ ⏸  Held — r/SaaS                                    │  --held, 15px medium
│                                                     │
│ Your Reddit account has 34 karma. r/SaaS filters    │  --ink-soft, 15px
│ posts from accounts under 50.                       │
│                                                     │
│ Comment on a few threads in r/SaaS this week. We'll │  --ink-muted, 13px
│ check again before the next slot.                   │
│                                                     │
│ [Reschedule]  [Post elsewhere]  [Edit]              │
└─────────────────────────────────────────────────────┘
```

`--held-wash` background, 1px `--held` at 25% opacity. Never red — this isn't an error, it's the
product working.

### Self-promo ratio meter
Reddit only. A horizontal bar: value posts (`--published`) vs promo posts (`--held`), with a marker
at the 20% threshold. Mono label: `2 / 10 promotional`.

This is a trust feature, not a gauge. Make it legible and slightly prominent — it's the visible
artifact of what they're paying for.

### Knowledge item
Fact in 15px `--ink`. Below: source favicon + domain, specificity as a 5-segment mono bar, category
chip. Hover reveals the source quote in a `--paper-sunken` well.

---

## Copy rules

Words are design material. Same care as spacing.

**Voice:** direct, technical, unhyped. Talk to a peer who ships code. Never sell inside the product —
they already bought.

| Rule | ❌ | ✅ |
|---|---|---|
| Active, specific verbs | "Submit" | "Schedule post" |
| Same word through a flow | "Publish" → "Content submitted" | "Publish" → "Published" |
| Errors explain and instruct | "Something went wrong" | "X rejected this as a duplicate. Edit the text and try again" |
| Errors never apologise | "Sorry! We couldn't post" | "Post held. LinkedIn needs re-authorisation" |
| Empty states invite action | "No posts yet" | "Nothing queued. Add a changelog and we'll draft from it" |
| No system vocabulary | "OAuth token expired" | "LinkedIn needs reconnecting" |
| Numbers over adjectives | "Great engagement!" | "47 clicks this week" |

**Never in the UI:** leverage, seamless, effortless, unlock, empower, supercharge, game-changer,
"AI-powered", exclamation marks in system messages.

**Onboarding copy is the exception** — it can have warmth. Everything after is quiet and functional.

---

## Motion

Sparing. Over-animation is the clearest AI-design tell and our user notices.

- **The one moment:** the onboarding crawl. Show real progress — pages found, facts extracted,
  counter ticking. The perceived effort is doing marketing for you. Do not hide it behind a spinner.
- Now-line drifts down the rail in real time (CSS transform, 60s tick)
- State change: 200ms colour transition, no bounce
- Card enter: 150ms fade + 4px rise. That's all
- `prefers-reduced-motion` respected everywhere

---

## Screens

**Onboarding** (highest-leverage UI in the product) — URL → live crawl → brand profile confirm →
connect channels → first 3 posts. Target: **previewable post in under 60 seconds.**

**Queue** (home) — the rail. Filters by channel. Needs-review items highlighted. This is where users
live.

**Composer** — split: editor left, live platform preview right. Char count in mono. Provenance
sidebar showing which facts this post came from.

**Knowledge** — the fact library. Searchable, filterable by source and specificity. Delete or correct
anything. Sources panel with poll status.

**Channels** — connected accounts, health, cadence, Reddit sub list with risk ratings.

**Settings** — plan, usage against limits, billing, projects.

---

## 📋 BRIEF — paste into Claude Design

> Design the **queue screen** for Postbliz, a social publishing tool for indie SaaS founders.
>
> **Direction — "the proof sheet":** a proofing desk where writing gets set, checked and released.
> Not a marketing suite, not a dark developer terminal, not a cream-and-serif editorial layout. The
> user is a technical founder who is allergic to marketing polish.
>
> **Signature element — The Rail:** a single vertical 1px rule down the left of the queue. Scheduled
> posts are ticks on it, spaced by time, with mono timestamps. A solid accent-blue "now" line spans
> the width at the current time. Post cards sit flush against the rail. **A held post breaks
> alignment — shifted 24px left with a visible gap in the rail** — so you see something has fallen
> out of the flow before reading a word. This is the one bold move; keep everything else quiet.
>
> **Palette:** ink `#17191F` on paper `#FCFCFA`. Rules `#E6E6E1`. Accent electric ink-blue `#2E3AE8`.
> Highlighter yellow `#FFE566` used **only** as a wash behind posts needing review, nowhere else.
> States: queued `#5B6BF0`, published `#2F8F5B`, held `#C77700`, failed `#C63737`.
>
> **Type:** Instrument Sans for UI, JetBrains Mono for all data — timestamps, handles, character
> counts, platform labels. Post content is 17px, larger than any chrome, because the writing is the
> material.
>
> **Content:** 6 post cards across a day — 2 published, 1 publishing now, 2 queued, 1 held. The held
> one is a Reddit post blocked by a karma check; show a held banner in amber wash explaining the
> account has 34 karma and r/SaaS requires 50, with the fix and three actions. Use realistic indie
> founder post copy — specific, first-person, explaining rather than advertising. Include a
> self-promotion ratio meter reading "2 / 10 promotional".
>
> Flat surfaces, 1px borders, minimal shadow. Responsive to mobile. Visible keyboard focus.

## 📋 BRIEF — onboarding

> Design the **onboarding flow** for Postbliz. Same direction and tokens as above.
>
> Four steps: (1) paste your product URL, (2) live crawl showing real progress — pages found, facts
> extracted, a ticking counter, the mechanism visible rather than a spinner, (3) confirm the extracted
> brand profile in editable fields, (4) connect X, LinkedIn and Reddit, then show the first three
> generated posts.
>
> Step 2 is the emotional peak — the moment the product proves it understands their product. Make the
> work visible. Show actual extracted facts appearing one by one.
>
> Warmer copy than the rest of the app, but never salesy. The user is technical and suspicious of
> hype. Show the mechanism; that's what earns their trust.

## 📋 BRIEF — landing page

> Design the **landing page**. Same tokens.
>
> Headline: **"It writes posts that explain what you built."** Sub: "Not ads. Not AI slop. Not the
> thing that gets you banned from r/SaaS."
>
> The hero is not a dashboard screenshot and not a gradient. It's a **side-by-side**: on the left, a
> generic AI-generated marketing post in grey, visibly hollow. On the right, a Postbliz post — specific,
> first-person, with a real number in it — with the source fact it came from shown beneath it, linked.
> The contrast *is* the pitch. That's the thesis, stated visually.
>
> Then: how it works in three steps (URL → facts → posts) · the Reddit safety section with the six
> checks as a real list · honest pricing · a founder note. No logos, no fake testimonials, no
> "trusted by thousands".

## Related

- [`ICP.md`](ICP.md) — the cringe-averse technical user this serves
- [`content-system.md`](content-system.md) — the same voice rules apply to generated posts
