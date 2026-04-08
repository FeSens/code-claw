Browser soak test — interactive verification that the app works like a real user would experience it.

Usage:
- `/soak --quick /drill /stats` — smoke test specific routes (per-story gate)
- `/soak --full` — full soak test of every route and flow (QA phase)

## Prerequisites

1. Dev servers must be running. If not: `pnpm dev &` and wait for both to be ready.
2. Playwright MCP must be available (configured in `.mcp.json`).

## Dispatch

This command MUST be run by a **Sonnet subagent**. The parent agent (Opus) dispatches it via:

```
Agent(model: "sonnet", prompt: "/soak --quick /drill /stats")
```

Do NOT run this as the main agent — Sonnet is faster and cheaper for browser interaction.

## Quick Mode (`--quick <routes...>`)

For each route provided in $ARGUMENTS:

1. **Navigate**: `browser_navigate` to `http://localhost:3000<route>`
2. **Wait**: Allow 3 seconds for hydration and async data loading
3. **Screenshot**: `browser_take_screenshot` — save to `/tmp/soak-<route-slug>.png`
4. **Console check**: `browser_console_messages` — record any errors or warnings
5. **Interact**: If the page has interactive elements (buttons, forms, links):
   - Click primary action buttons
   - Fill form inputs with valid test data
   - Submit forms
   - After each interaction: check console for new errors, take screenshot if something changed
6. **Record**: Write findings for this route

## Full Mode (`--full`)

1. **Discover routes**: Read `apps/web/src/app/` directory tree. Every `page.tsx` is a route.
   Map file paths to URL paths (e.g., `app/drill/page.tsx` → `/drill`, `app/(auth)/login/page.tsx` → `/login`).

2. **Test each route**: Run the Quick Mode steps for every discovered route.

3. **Test user flows**: Navigate through multi-page journeys:
   - **Auth flow**: `/register` → fill form → submit → should redirect → `/login` → fill form → submit → should reach `/dashboard`
   - **Navigation flow**: Click nav links from the home page, verify each destination loads
   - **Protected routes**: Try accessing `/dashboard` without auth → should redirect to `/login`

4. **Cross-page state**: After completing a flow, verify state persists (e.g., logged-in user sees their name).

## Report

After all routes and flows are tested, write `soak-report.json` to the project root:

```json
{
  "mode": "quick | full",
  "timestamp": "ISO-8601",
  "routes": [
    {
      "route": "/drill",
      "status": "pass | fail",
      "consoleErrors": ["TypeError: ..."],
      "consoleWarnings": ["Warning: ..."],
      "visualIssues": ["Submit button overlaps timer"],
      "screenshotPath": "/tmp/soak-drill.png",
      "interactions": ["clicked Start button", "typed answer '42'", "submitted form"],
      "suggestions": ["Check DrillPage — score state may be null before first problem"]
    }
  ],
  "flows": [
    {
      "name": "auth-flow",
      "steps": ["/register → fill form → /login → fill form → /dashboard"],
      "status": "pass | fail",
      "error": null
    }
  ],
  "summary": {
    "passed": 4,
    "failed": 1,
    "total": 5,
    "consoleErrorCount": 2,
    "visualIssueCount": 1
  }
}
```

## What to Look For

### Console Errors (always fail)
- `TypeError`, `ReferenceError`, `SyntaxError` — JS runtime errors
- `Unhandled Promise Rejection`
- `Failed to fetch` — broken API calls
- `Hydration mismatch` — SSR/client mismatch

### Console Warnings (note but don't fail)
- React `key` warnings
- Deprecation warnings
- Missing image alt text

### Visual Issues (fail)
- Overlapping elements
- Text cut off or unreadable
- Broken layout (elements stacked incorrectly)
- Missing content (empty sections that should have data)
- Error messages rendered on screen (like "Something went wrong")

### NOT Issues (ignore)
- Unstyled flash during dev hot reload
- Dev-mode React warnings about strict mode double renders
- Missing favicon

## Rules

- ALWAYS write soak-report.json before finishing, even if everything passes.
- ALWAYS take at least one screenshot per route, even if it passes.
- If a page doesn't load within 10 seconds, record it as a failure with "timeout" status.
- If Playwright MCP is not available, report the error clearly — don't silently skip.
- Provide SPECIFIC fix suggestions — name the component, the likely state issue, the file path if you can infer it.
