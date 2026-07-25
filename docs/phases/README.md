# Build Phases

Executable runbooks. One file per phase, each containing paste-ready Claude Code prompts, a testable
gate, and troubleshooting for what actually goes wrong.

[`mvp-scope.md`](../product-information/mvp-scope.md) is the overview. **These files are the work.**

---

## The path

| Phase | File | Hours | Gate |
|---|---|---|---|
| 0 | [Foundation](phase-0-foundation.md) | ~50 | Sign up, create a project, a scheduled task fires |
| 1 | [Ingestion](phase-1-ingestion.md) | ~28 | A real URL yields 25+ facts you'd happily post |
| 2 | [Generation](phase-2-generation.md) | ~28 | 10 posts generated, 7 publishable unedited |
| 3 | [Publishing](phase-3-publishing.md) | ~56 | 14 days publish unattended, no double-posts |
| 4 | [Reddit](phase-4-reddit.md) | ~56 | 5 subs over 2 weeks, nothing removed |
| 5 | [Money](phase-5-money.md) | ~28 | You pay yourself with a real card, limits bite |
| 6 | [Launch](phase-6-launch.md) | ~28 | Live, dogfooded 2 weeks, first customer |

**~275 hours. At 25–30/week that's 10 weeks.**

---

## Rules

**One phase at a time.** Every prompt ends with "then stop" for a reason — Claude Code will happily
run into the next phase and you'll lose the ability to verify anything.

**Never skip a gate.** The gate is the only thing standing between you and building four phases on a
broken foundation. If a gate fails, fix it before moving on. A failed gate is information, not a
delay.

**Task 1.0 is the go/no-go.** The spike in Phase 1 validates the product's core premise for about
$3 and one hour. Run it early — it's the only step that can honestly tell you to stop. You can run
it during Phase 0 while installs are churning.

**Each prompt is one Claude Code session.** Fresh context per task. Long sessions drift, forget the
hard rules, and start inventing.

**Append to [`decisions.md`](../product-information/decisions.md)** when you make a call the docs
didn't anticipate. Future-you will not remember why.

---

## If you fall behind

Expected — the estimates assume nothing goes wrong, and something always does.

**Cut scope inside a phase. Never extend the timeline.**

Ordered by what to drop first:

1. Instagram + TikTok publishing (Phase 3) — saves ~8h, costs almost nothing at MVP
2. Subreddit recommendation (Phase 4) — let users type sub names manually, saves ~10h
3. Short links and click tracking (Phase 5) — saves ~6h, delays proof of value
4. Weekly digest (Phase 5) — saves ~5h, hurts retention

**Never cut:** any of the six Reddit checks, the ongoing sources, idempotent publishing, or the
X link-in-reply rule. Those are the product.

---

## Progress

Tick as gates pass. This is your honest status, not the vibes.

- [ ] Phase 0 — Foundation
- [ ] Phase 1 — Ingestion ← includes the go/no-go spike
- [ ] Phase 2 — Generation
- [ ] Phase 3 — Publishing
- [ ] Phase 4 — Reddit
- [ ] Phase 5 — Money
- [ ] Phase 6 — Launch
- [ ] **Week 12 checkpoint** — see [`risk-register.md`](../product-information/risk-register.md)
