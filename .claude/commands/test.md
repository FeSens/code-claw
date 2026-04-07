Run the test suite for the area of code I'm working on.

1. Determine which app/package was modified (web, api, db, shared).
2. Run the appropriate test command:
   - `apps/api`: `pnpm --filter @code-claw/api test:unit`
   - `apps/web`: `pnpm --filter @code-claw/web test:unit`
   - `packages/*`: `pnpm --filter <package> test`
3. If tests fail, analyze and fix them.
4. Re-run until all tests pass.
