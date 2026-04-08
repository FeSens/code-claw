# Browser Soak Testing via Playwright MCP + Sonnet Subagent

## Overview

Interactive browser testing at two layers: quick per-story smoke and full QA soak. A Sonnet subagent uses Playwright MCP to navigate, click, screenshot, and check console errors — then reports back to Opus with structured findings and fix suggestions.

## Playwright MCP Configuration

Project-level MCP server in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless"]
    }
  }
}
```

Tools available: `browser_navigate`, `browser_click`, `browser_type`, `browser_take_screenshot`, `browser_snapshot`, `browser_console_messages`.

## `/soak` Command

Two modes:

### Quick Mode (`/soak --quick <routes...>`)
- Per-story gate. Only affected routes.
- Per route: navigate → wait → screenshot → check console → interact with elements.
- ~30 seconds per route.

### Full Mode (`/soak --full`)
- QA phase. Discovers all routes from `apps/web/src/app/` page files.
- Per route: same as quick + follow user flows (links, forms, redirects).
- Tests auth flows: register → login → protected pages → logout.
- Tests cross-page navigation.
- 2-5 minutes full sweep.

## Report Format (`soak-report.json`)

```json
{
  "mode": "quick | full",
  "timestamp": "ISO-8601",
  "routes": [
    {
      "route": "/drill",
      "status": "pass | fail",
      "consoleErrors": [],
      "visualIssues": [],
      "screenshotPath": "/tmp/soak-drill.png",
      "suggestions": []
    }
  ],
  "flows": [
    {
      "name": "drill-to-stats",
      "steps": ["/ → /drill → answer 3 → /stats"],
      "status": "pass | fail"
    }
  ],
  "summary": { "passed": 0, "failed": 0, "total": 0 }
}
```

## Integration Points

### Ralph Per-Story Gate
After `pnpm build`, if UI changes: dispatch Sonnet subagent with `/soak --quick <affected-routes>`. Read `soak-report.json`. If any route fails, fix before committing.

### QA Phase (stop-loop.mjs)
New step between "build" and "screenshots": `soak`. Instruction: dispatch Sonnet with `/soak --full`. Read report. Fix failures. Set `qa.soak` to "pass" when clean.

### Subagent Dispatch
Opus dispatches via `Agent` tool with `model: "sonnet"`. The subagent runs the `/soak` command using Playwright MCP tools. Returns the report content.

## Files

| File | Action | Purpose |
|------|--------|---------|
| `.claude/settings.json` | MODIFY | Add playwright MCP server |
| `.claude/commands/soak.md` | NEW | Soak test command definition |
| `.claude/commands/ralph.md` | MODIFY | Wire quick soak into per-story gate |
| `.claude/hooks/stop-loop.mjs` | MODIFY | Add soak step to QA phase |
| `CLAUDE.md` | MODIFY | Add soak to "Before Completing Any Task" |
