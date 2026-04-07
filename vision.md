# Vision: Never Code

The gold standard template for agentic fullstack engineering.

## What This Is

A production-quality TypeScript monorepo template where the AI harness is the product. You clone it, strip the demo landing page, and start building — with an autonomous development loop, immutable quality gates, and structured workflows already wired in.

Nobody else has this. Fullstack templates ignore AI tooling. AI setups are thin on the stack. We're the intersection.

## Who It's For

Developers who use Claude Code (or similar AI agents) as their primary coding tool and want a repo that's purpose-built for that workflow — not retrofitted.

## What Makes Someone Say "This Is Amazing"

1. You clone it, run `/ralph add user authentication`, and walk away. Come back to working auth with tests, types, and clean code.
2. Every commit the agent makes passes lint, typecheck, and tests — automatically, always.
3. The agent can see what it built (screenshots), knows the rules (scoped CLAUDE.md), and cleans up after itself (deslop).
4. The experiment log shows you exactly what was tried, what worked, what was discarded.

## Roadmap

### Quick Wins
- [ ] Auth scaffold (email/password, sessions, protected routes)
- [ ] API error handling middleware with typed error responses
- [ ] Database seed with realistic data + reset command
- [ ] `/onboard` command — auto-generate CLAUDE.md context from existing code
- [ ] Healthcheck dashboard page (shows API status, DB connection, test results)

### Big Bets
- [ ] Self-maintaining CLAUDE.md — a hook that updates rules when project structure changes
- [ ] `/deploy` command — one-command deployment to Vercel/Fly.io with env validation
- [ ] Protected zones — mark files as read-only in `.claude/settings.json` so agents can't touch them

### Moonshots
- [ ] Agent scorecard — track success rate, discards, token usage per feature across sessions
- [ ] `/collab` — human writes the test, agent implements. Or vice versa. True pair programming loop.
