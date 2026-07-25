# Postbliz

**It writes posts that explain what you built** — the way you'd explain it to a
friend. So they don't read as ads, don't read as AI slop, and don't get you
banned from Reddit.

Point Postbliz at your product URL, connect your accounts, and it drafts
platform-native posts grounded in real facts about what you shipped — then
publishes them on a human cadence, with a safety gate that keeps Reddit from
banning you.

> Built for founders who ship things and would rather write code than write
> marketing copy.

<!-- screenshots go here -->

---

## Cloud or self-host

| | Self-host | Cloud |
|---|---|---|
| **Cost** | $20–60/mo in your own API keys | From $19/mo, all-in |
| **Setup** | ~1 hour + ongoing maintenance | 2 minutes |
| **Updates** | You pull and migrate | Automatic |
| **Support** | GitHub issues, best-effort | Email, from a human |
| **Reddit rules data** | You start empty | Pre-cached and maintained |

Postbliz is **AGPL-3.0** and fully open. Self-hosting is free of *our* charge —
but not free of cost. You bring your own API keys, and LLM/crawl/publishing
calls cost money: **expect $20–60/month** depending on volume.

## Self-host quickstart

**Requirements:** [Bun](https://bun.sh), a [Neon](https://neon.com) Postgres
database (Postgres 18), and accounts for the services below.

```bash
git clone https://github.com/vivek8110/postbliz.git
cd postbliz
bun install

cp .env.example .env      # then fill it in — see docs/self-hosting/env-setup.md
bun run db:migrate        # apply the schema to your database
bun run dev               # http://localhost:3000
```

You'll need your own keys for: **Neon** (database), **BetterAuth + Google OAuth**
(login), **Trigger.dev** (jobs), **Firecrawl** (crawling), **OpenRouter** (LLM),
**Cloudflare R2** (media), **PostPeer** (publishing to X/LinkedIn/IG/TikTok),
**Reddit** (direct), **Resend** (email), **Dodo** (billing), plus **Sentry** and
**PostHog**. The step-by-step guide walks through every one:
[`docs/self-hosting/env-setup.md`](docs/self-hosting/env-setup.md).

## Stack

Next.js 16 (App Router) · Drizzle + Postgres on Neon · BetterAuth ·
Trigger.dev v4 · Firecrawl · Vercel AI SDK → OpenRouter · Cloudflare R2 ·
Resend · Dodo Payments · Tailwind + shadcn/ui · PostHog · Sentry. Package
manager: Bun.

## Docs

Product and engineering docs live in
[`docs/product-information/`](docs/product-information/); the phase-by-phase
build runbook is in [`docs/phases/`](docs/phases/).

## Contributing

Postbliz is deliberately narrow — that narrowness is the product. Read
[`CONTRIBUTING.md`](CONTRIBUTING.md) for what we welcome, what to discuss first,
and what we won't merge. Contributors sign a lightweight [CLA](CLA.md).

Found a security issue? See [`SECURITY.md`](SECURITY.md) — please report it
privately.

## License

[AGPL-3.0](LICENSE). If you run a modified version as a network service, you
must publish your modifications.
