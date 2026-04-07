# Autoresearch + Stripe Minions: Synthesis for Fullstack Development

> Combining Karpathy's autonomous research loop with Stripe's blueprint architecture.

## Sources

- [Karpathy's Autoresearch](https://github.com/karpathy/autoresearch)
- [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Stripe Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

## Key Concepts Extracted

### From Autoresearch (Karpathy)

| Concept | How it works |
|---------|-------------|
| **LOOP FOREVER** | Agent runs indefinitely: hypothesize → modify → run → evaluate → keep/discard → repeat |
| **Single metric** | One objective number (val_bpb) makes keep/discard decisions binary |
| **Fixed evaluation harness** | `prepare.py` is immutable. Agent can't game the metric. |
| **Git as experiment tracking** | Each experiment = commit. Keep = advance branch. Discard = `git reset`. |
| **results.tsv lab notebook** | Append-only log of every attempt (kept, discarded, crashed) |
| **Context management** | Output → `run.log`, extract only key metrics via `grep` |
| **Minimal file surface** | Only ONE file is mutable (`train.py`). Everything else is read-only. |
| **5-minute budget** | Fixed time per experiment makes results comparable |
| **Simplicity criterion** | Equal results with simpler code is preferred |

### From Stripe Minions

| Concept | How it works |
|---------|-------------|
| **Blueprints** | State machine mixing deterministic nodes (lint, push) with agent nodes (implement, fix) |
| **Devboxes** | Isolated, pre-warmed environments. 10-second spinup. Full permissions. |
| **Scoped rules** | Directory-level CLAUDE.md files, not one giant global context |
| **2-round CI cap** | Max 2 CI attempts, then handoff to human. Diminishing returns. |
| **Curated tool sets** | Agents get task-relevant tools, not all 500 available |
| **Shift feedback left** | Lint <1s locally, not waiting for CI pipeline |
| **One-shot execution** | Fully unattended, async. No human in the loop during execution. |
| **Deterministic > Agentic** | Make everything deterministic that CAN be deterministic |

## What Our Repo Is Missing

### 1. The Experiment Loop (from Autoresearch)

**Missing**: A structured loop that lets Claude iterate autonomously on a feature, keeping what works and discarding what doesn't.

**Solution**: A `/loop` slash command that implements:
```
LOOP:
  1. Read current state (git status, failing tests)
  2. Hypothesize a change
  3. Implement it
  4. Commit
  5. Run quality gates (pnpm check)
  6. If PASS → keep, advance
  7. If FAIL → git reset, try different approach
  8. Log attempt to experiments.tsv
  9. GOTO 1
```

### 2. The Results Log (from Autoresearch)

**Missing**: An append-only log tracking every attempt (successful or not).

**Solution**: An `experiments.tsv` file that tracks:
```
timestamp  commit_hash  status  typecheck  tests_pass  lint  description
```

### 3. Blueprint Pattern (from Stripe)

**Missing**: Deterministic nodes that run without LLM involvement. Currently everything goes through Claude.

**Solution**: A `/implement` command that enforces a blueprint:
```
DETERMINISTIC: git checkout -b feature/<name>
DETERMINISTIC: pnpm install
AGENT: Implement the feature (with TDD)
DETERMINISTIC: pnpm exec biome check --write .
DETERMINISTIC: pnpm typecheck
AGENT: Fix any type errors
DETERMINISTIC: pnpm test:unit
AGENT: Fix any test failures (max 3 attempts)
DETERMINISTIC: pnpm test:integration (if API changes)
AGENT: Fix failures (max 2 attempts)
DETERMINISTIC: git add -A && git commit
DETERMINISTIC: Log results to experiments.tsv
```

The key insight: **lint, format, typecheck are ALWAYS deterministic**. Never ask the LLM to "check if it passes" — just run the command.

### 4. 2-Round CI Cap (from Stripe)

**Missing**: No limit on how many times Claude retries failing tests. Can loop forever burning tokens.

**Solution**: Hard cap of 2 retry rounds for any test failure. After that, summarize the issue and hand back to human.

### 5. Scoped Context (from Stripe)

**Status**: We already have directory-level CLAUDE.md files. This is done.

### 6. Isolated Execution (from Stripe Devboxes)

**Status**: We have worktree support for isolation. Equivalent to devboxes for local development.

### 7. Immutable Evaluation Harness (from Autoresearch)

**Missing**: Nothing prevents the agent from modifying test configs, coverage thresholds, or biome rules to "pass."

**Solution**: Mark these files as read-only in CLAUDE.md:
```
## Read-Only Files (DO NOT MODIFY)
- biome.json
- tooling/vitest/base.config.ts
- tooling/typescript/base.json
- lefthook.yml
- .github/workflows/ci.yml
- turbo.json
```

### 8. Simplicity Criterion (from Autoresearch)

**Missing**: No incentive for the agent to write less code.

**Solution**: Add to CLAUDE.md:
```
## Simplicity Rule
When two implementations achieve the same test results:
- Prefer fewer lines of code
- Prefer fewer files changed
- Prefer fewer dependencies added
- Prefer removing code over adding code
```

## Implementation Plan

### Phase 1: Blueprint Command (`/implement`)

A structured slash command that enforces deterministic + agent node ordering:

```
/implement <feature-description>
```

Blueprint:
1. [DETERMINISTIC] Create feature branch
2. [AGENT] Plan implementation (identify files, tests needed)
3. [AGENT] Write failing tests (TDD red phase)
4. [DETERMINISTIC] Run tests (confirm they fail)
5. [AGENT] Implement feature (TDD green phase)
6. [DETERMINISTIC] `biome check --write .`
7. [DETERMINISTIC] `pnpm typecheck`
8. [AGENT] Fix type errors (max 2 rounds)
9. [DETERMINISTIC] `pnpm test:unit`
10. [AGENT] Fix test failures (max 2 rounds)
11. [DETERMINISTIC] Log to experiments.tsv
12. [DETERMINISTIC] Commit

### Phase 2: Experiment Loop (`/experiment`)

For iterative improvement (closer to autoresearch):

```
/experiment <goal>
```

Loop:
1. Read current metric (test count, coverage, performance)
2. Hypothesize an improvement
3. Implement it in a commit
4. Run quality gates
5. If improved → keep. If not → git reset.
6. Log to experiments.tsv
7. Repeat (max 10 iterations per session)

### Phase 3: Parallel Worktree Agents

Dispatch multiple worktree agents working on different aspects simultaneously:

```
/parallel-implement <feature>
```

Spawns:
- Agent 1 (worktree): Backend implementation + tests
- Agent 2 (worktree): Frontend implementation + tests
- Main: Monitors progress, merges results, runs E2E
