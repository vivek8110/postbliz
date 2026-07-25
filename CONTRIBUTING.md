# Contributing to Postbliz

Thanks for your interest. Postbliz is deliberately narrow — it writes posts that
explain what you built, safely. That narrowness is the product, and it shapes
what we can accept.

## What we welcome

Bug fixes · new platform integrations · documentation · translations ·
self-hosting improvements · tests.

## Discuss first (open an issue before a PR)

Anything touching the **safety gate**, the **generation pipeline**, or the
**data model**. These are load-bearing; a well-meaning change can create account
risk or data problems. Let's align on the approach first.

## What we won't merge

- Features that increase account risk — engagement automation, bulk
  cross-posting, follow/unfollow, or anything that games a platform.
- Anything that removes or weakens a safety check.
- Anything that meaningfully expands scope. If it makes Postbliz a general
  "social media manager," it's out.

## Ground rules

- **Sign the [CLA](CLA.md).** One line in your first PR: *"I have read the CLA
  and I agree to it."*
- **Never commit real data or secrets** — not in code, tests, or fixtures. This
  repo is public.
- **Secret scanning runs on every commit.** Install the pre-commit hook so
  `gitleaks` catches leaks before they leave your machine:
  ```bash
  pip install pre-commit && pre-commit install
  ```
  It also runs in CI on every push and pull request.
- **Keep PRs focused.** One concern per PR; we squash-merge.

## Development

See the [README](README.md) for the self-host quickstart and required
environment variables. In short: copy `.env.example` to `.env`, fill it in
(guide in `docs/self-hosting/env-setup.md`), then `bun install` and `bun run dev`.

## Support

GitHub issues are **best-effort** — Postbliz is maintained by a solo founder
with a full-time job. Paying customers on the hosted plan get email support.
That's not a brush-off; it's what keeps the project alive.
