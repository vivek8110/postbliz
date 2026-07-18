# Competitive Landscape

Researched July 2026. **This market is crowded.** Dozens of funded and indie tools. Winning requires
narrowness, not features.

> **Source caution:** most "best social media API" rankings are vendor blogs ranking themselves first.
> Blotato's blog ranks Blotato #1, Zernio's ranks Zernio #1, SocialClaw's ranks SocialClaw #1. Treat
> all of it as marketing. Verify pricing on the vendor's own pricing page before quoting it.

---

## The map

Four groups. We're creating a fifth position.

```
                    HIGH AI / CONTENT
                          │
   AI writers             │            ◆ POSTBLIZ
   Blaze, Marky,          │              grounded generation
   Apaya, Predis          │              + Reddit safety
                          │
  ────────────────────────┼────────────────────────
  BROAD                   │                   NARROW
  (many platforms)        │            (one job, done fully)
                          │
   Schedulers             │            Platform specialists
   Buffer, Publer,        │            Typefully (X/LI)
   post-bridge, Postiz    │            Hypefury (X)
                          │            Taplio (LinkedIn)
                    LOW AI / SCHEDULING
```

---

## Direct threats

### post-bridge — the closest competitor

$26.58–82.50/mo · ~1,405 customers · solo founder (Jack) · Stripe

Same ICP, same founder story, same channels. Ships a developer API as a **$5/mo add-on requiring an
active subscription**, an MCP server, and a Claude Code agent skill. Content Studio for video
templates. Explicitly positions against Buffer/Hootsuite on price.

**Beats us on:** price, maturity, trust, video templates, a real audience already built.
**We beat them on:** they have **no Reddit**, no content generation from your product, no grounding —
you still face a blank box. They solve distribution; the blank page is untouched.

**Why we didn't build on their API:** it's a consumer subscription with an API bolted on, not
multi-tenant infrastructure — and building on a direct competitor is a bad position regardless.

> **Watch this one.** If Jack adds Reddit + AI generation, our differentiation narrows sharply.
> Track their changelog monthly.

### Postiz — open-source, same stack

Free self-host · cloud from ~$23–29/mo · **$1.3M ARR** · 30+ platforms
Stack: NestJS, NextJS, Temporal, Postgres, Tailwind, React Native

The strongest proof that open-source works in this category, and the strongest argument that
platform count is not a moat. Leaning agentic.

**Beats us on:** platform breadth, GitHub distribution, self-host credibility, head start.
**We beat them on:** they're infrastructure — an empty scheduler. No opinion about *what* to post.
No Reddit safety layer. Their generosity of scope is our narrowness of purpose.

**Since we're also open-sourcing**, we compete on opinion, not on freedom. See
[`open-source.md`](open-source.md).

### Blotato — AI content factory

$29/mo flat · 9 platforms · MCP server at `mcp.blotato.com/mcp` · n8n + Make nodes

AI writing, image generation, faceless video, viral templates, cross-posting. "A week of content in
60 seconds." Prolific content marketing operation — most of the API comparison articles you'll find
are theirs.

**Beats us on:** media generation, volume, breadth of AI features, SEO footprint.
**We beat them on:** volume is their thesis and it's the opposite of ours. Faceless-video content
farms are precisely the AI slop our ICP is embarrassed by. Different customer.

### Apaya / Marky / Blaze.ai — the URL-to-autopilot cohort

$30–39/mo · SMB and creator focused

**Exactly our onboarding hook.** Apaya's pitch: enter your website URL, the crawler analyses your
homepage, about pages and product descriptions, extracts tone and messaging, generates and schedules
posts. Semrush, GoHighLevel and others ship brand-voice-from-URL too.

**This is why URL onboarding cannot be our differentiation.** It's table stakes.

**We beat them on:** they crawl once and generate marketing copy forever. We ingest continuously and
generate explanations. That's the whole difference and it shows up in month two, when their queue
starts repeating itself and ours doesn't.

---

## Adjacent

| Tool | Price | Position | Overlap |
|---|---|---|---|
| **Typefully** | $8–39/mo | X + LinkedIn writing, beloved by serious writers | High on X/LI. No Reddit, no generation from your product |
| **Hypefury** | ~$19/mo | X growth: auto-retweet, auto-plug, evergreen | Growth-hack features we've explicitly refused |
| **Taplio** | ~$39/mo | LinkedIn AI agent — writes, schedules, engages | LinkedIn only |
| **Buffer** | Free–$120 | The incumbent. 11 platforms, free tier for 3 channels | Broad, generic, no opinion |
| **Publer / SocialBee / Metricool** | $15–50 | Mid-market all-rounders | Wrong ICP, agency-shaped |
| **Hootsuite / Sprout** | $99–249+ | Enterprise | Not our world |

## Reddit-specific — the emerging threat

| Tool | What |
|---|---|
| **RedditGrow** | AI opportunity detection, 7-day account warm-up, shadowban detection, safe posting with rate limiting |
| **Conbersa** | Multi-account Reddit distribution campaigns |

These are the ones to actually worry about — they're building depth in our moat. **But** they're
Reddit-only, which means a founder still needs a second tool for X and LinkedIn. Our bet is that
Reddit-safe *plus* multi-platform beats Reddit-only.

If they add other platforms, reassess.

---

## Infrastructure layer (not competitors — suppliers)

| Provider | Model | Reddit? | Fit |
|---|---|---|---|
| **PostPeer** | Credits, unlimited accounts. $25/2k → $120/20k | ❌ | **Chosen for 4 platforms** |
| **Zernio** (ex-Late) | Per account: 2 free, then $6 → $3 → $1 | ✅ | Fallback if PostPeer fails |
| **Ayrshare** | $149/mo for 1 profile, $599 for 30 | ✅ | Too expensive for multi-tenant |
| **Blotato API** | $29 flat, 9 platforms | ❌ | Competitor |
| **bundle.social** | 14+ platforms, MCP server | ✅ | Worth evaluating as fallback |

---

## Where we win, honestly

| | Us | Them |
|---|---|---|
| **Grounded generation** | Every post traces to a real fact from a live source | Crawl once, generate marketing copy forever |
| **Reddit safety** | Six checks, rule engine, ratio tracking | Nobody in the mainstream category |
| **Explain, don't advertise** | The entire content thesis | Everyone optimises for "engaging" |
| **Doesn't run dry** | RSS + changelog + weekly prompt | Site content exhausts in weeks |

## Where we lose, honestly

- **Price.** post-bridge is $9–26. We can't win there and shouldn't try
- **Platform count.** 5 vs 30. Say it's deliberate, because it is
- **Media generation.** Blotato does video, we don't
- **Maturity.** Everyone here has customers, testimonials, and SEO we don't
- **Distribution.** post-bridge and Blotato have audiences. We have zero

## Strategic reads

1. **Platform count is not a moat.** Everyone can add platforms. Postiz has 30 and still competes on
   price. Compete on opinion.
2. **The unified-API layer is commoditising** — a dozen thin wrappers around the same platform APIs
   competing on price. Good for us as a buyer, and a reason never to become one.
3. **AI features are commoditising too.** "AI writes your posts" is now table stakes. *Grounded* AI
   with provenance is not — yet.
4. **Reddit is the one real gap.** Mainstream tools avoid it because the downside is scary. That's
   exactly why it's defensible. Move before RedditGrow goes multi-platform.

## Review cadence

Re-check quarterly: post-bridge changelog (Reddit? generation?) · Postiz releases · RedditGrow
platform expansion · PostPeer pricing and Reddit support · new entrants on Product Hunt.

## Related

- [`product-brief.md`](product-brief.md) — positioning
- [`pricing-and-unit-economics.md`](pricing-and-unit-economics.md) — pricing against this field
