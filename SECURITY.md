# Security Policy

Postbliz holds people's connected social accounts and their encrypted OAuth
tokens. We take security seriously and respond fast.

## Reporting a vulnerability

**Please do not open a public issue for a security vulnerability.**

Report it privately, one of two ways:

1. **GitHub private advisory (preferred):** open the repository's **Security**
   tab → **Report a vulnerability**. This keeps the report private and lets us
   collaborate on a fix.
2. **Email:** `security@postbliz.co`.

Please include enough detail to reproduce — affected endpoint or component,
steps, and impact.

## What to expect

- **Acknowledgement within 48 hours.**
- An assessment and, where valid, a fix timeline shortly after.
- Credit in the release notes once a fix ships, if you'd like it.

## Scope

In scope: this repository and the hosted Postbliz service. Especially valuable:
anything touching token storage/encryption, tenant isolation (cross-user data
access), the Reddit safety gate, webhook signature verification, or
authentication.

Out of scope: reports from automated scanners with no demonstrated impact, and
issues in third-party services we integrate with (report those upstream).

Please act in good faith: don't access or modify other users' data, and don't
run denial-of-service or spam tests against the hosted service.
