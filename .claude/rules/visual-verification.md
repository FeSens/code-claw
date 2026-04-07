---
paths:
  - "apps/web/src/app/**/*.tsx"
  - "apps/web/src/app/**/*.css"
  - "apps/web/src/components/**"
---

# Visual Verification Rules

After changing UI components or pages, verify visually:

1. Take a screenshot: `cd apps/web && npx playwright screenshot --wait-for-timeout=2000 "http://localhost:3000" /tmp/page-screenshot.png`
2. Read the screenshot with the Read tool to inspect it.
3. Check: layout, spacing, colors, text readability, no overflow.

Use `/screenshot` slash command for quick visual checks.

For Playwright MCP (interactive browser exploration):
```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

- Prefer accessibility snapshots (`browser_snapshot`) for content verification — 2-8x cheaper in tokens than screenshots.
- Use visual screenshots (`browser_take_screenshot`) only when verifying CSS, layout, colors, or images.
