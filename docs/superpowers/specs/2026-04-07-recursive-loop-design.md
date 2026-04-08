# Recursive Self-Improvement Loop

## Overview

A fully autonomous, infinite development loop driven by the Stop hook. Claude implements features via `/ralph`, runs a full QA audit, then generates new features via `/dream-bigger` — forever, until Ctrl+C.

## State Machine

```
IMPLEMENTING → QA → DREAMING → IMPLEMENTING → ...
```

- **IMPLEMENTING**: Pick highest-impact feature, run `/ralph`. Repeat until queue empty.
- **QA**: Screenshot all routes, full E2E, `/review`, `/deslop`. All must pass.
- **DREAMING**: Run `/dream-bigger`, score features by impact, write to queue.

Exit conditions: Ctrl+C, `phase: "idle"`, or delete `loop-state.json`.

## State File: `loop-state.json`

```json
{
  "phase": "implementing | qa | dreaming | idle",
  "cycle": 1,
  "currentFeature": "feat-id | null",
  "features": [
    {
      "id": "feat-1",
      "title": "Feature title",
      "description": "What to build",
      "scope": ["apps/web"],
      "impact": {
        "userValue": 7,
        "differentiation": 6,
        "feasibility": 9,
        "score": 7.3
      },
      "status": "pending | in_progress | done | decomposed",
      "parent": "null | feat-id"
    }
  ],
  "qa": {
    "screenshots": "null | pass | fail",
    "e2e": "null | pass | fail",
    "review": "null | pass | fail",
    "deslop": "null | pass | fail"
  },
  "history": [
    { "cycle": 1, "completed": 3, "decomposed": 1, "timestamp": "ISO-8601" }
  ]
}
```

### Impact Scoring

`score = (userValue * 0.4) + (differentiation * 0.3) + (feasibility * 0.3)`

Dream-bigger assigns scores when generating features. Agent always picks highest score first.

### Feature Status Flow

- Happy path: `pending → in_progress → done`
- Stuck path: `in_progress → decomposed` (spawns 2-3 children with `parent` pointer)
- A decomposed feature is considered done when all its children are done.

## Stop Hook Orchestrator: `stop-loop.mjs`

Node.js script called by the Stop hook after `stop-gate.sh`. Reads `loop-state.json`, determines next action, outputs instruction to stderr, exits 2 to block stop.

### Phase: IMPLEMENTING

1. If current feature in_progress: check `experiments.tsv` for 3+ recent discards on same feature.
   - 3+ discards → mark `decomposed`, instruct Claude to break into sub-features, score them, add to queue, pick next.
   - Otherwise → instruct Claude to continue `/ralph` on current feature.
2. If current feature done: pick next highest-score pending feature, update `currentFeature`, instruct `/ralph`.
3. If no pending features: transition to `qa`, reset qa fields to null, instruct QA audit.

### Phase: QA

1. Find first null QA step (screenshots → e2e → review → deslop), instruct that step.
2. If any step is `fail`: instruct fix and re-run.
3. If all `pass`: transition to `dreaming`, instruct `/dream-bigger`.

### Phase: DREAMING

1. If new pending features exist: transition to `implementing`, increment cycle, log history, pick highest-score, instruct `/ralph`.
2. If no new features: instruct `/dream-bigger` to generate and score features.

### Phase: IDLE / No File

Allow exit (exit 0).

## QA Audit Gate

Runs in strict order:

1. **Screenshots**: Discover routes from `apps/web/src/app/` page files, screenshot each, visually inspect.
2. **E2E**: `cd apps/web && PLAYWRIGHT_HTML_OPEN=never npx playwright test --reporter=line`
3. **Review**: `/review` on changes since cycle start.
4. **Deslop**: `/deslop` to clean AI bloat.

Each step updates `qa.<step>` in loop-state.json. On failure, Claude fixes and re-runs. Hook won't advance until all pass.

## Self-Healing Decomposition

When 3+ discards detected on a feature:

1. Mark feature `decomposed`
2. Claude analyzes the failure
3. Breaks into 2-3 smaller sub-features
4. Each sub-feature inherits parent's userValue/differentiation, gets fresh feasibility score
5. Written to loop-state.json with `parent` pointer
6. Highest-scored sub-feature picked next

## Dream-Bigger Integration

Existing `/dream-bigger` command modified to also:

1. Score each proposed feature (userValue, differentiation, feasibility)
2. Compute weighted score
3. Write features to `loop-state.json` with status `pending`
4. Continue updating `vision.md` as the human-readable record

## Initialization

`init-loop.mjs` seeds `loop-state.json`:

1. Reads `vision.md` roadmap
2. Parses features (quick wins / big bets / moonshots)
3. Outputs initial JSON with features to be scored
4. Sets `phase: "implementing"`

Run: `node .claude/hooks/init-loop.mjs`

## Files

| File | Action | Purpose |
|------|--------|---------|
| `.claude/hooks/stop-loop.mjs` | NEW | Orchestrator state machine |
| `.claude/hooks/init-loop.mjs` | NEW | Seeds loop-state.json from vision.md |
| `.claude/settings.json` | MODIFY | Add stop-loop.mjs to Stop hooks |
| `.claude/commands/dream-bigger.md` | MODIFY | Add loop-state.json write step |
| `loop-state.json` | RUNTIME | State file, created by init |
