---
paths:
  - "packages/shared/**"
  - "packages/db/**"
---

# Shared Package Rules

- `@code-claw/shared` MUST have zero runtime dependencies except `zod`. NEVER add utility libraries.
- `@code-claw/db` exports go through `src/index.ts` and `src/schema/index.ts`. NEVER import internal files directly.
- NEVER import from `@code-claw/api` or `@code-claw/web` in shared packages. Dependency flows downward only.
- Every Zod schema MUST have a companion exported type: `export type X = z.infer<typeof xSchema>`.
- When adding new exports, update BOTH the barrel `index.ts` AND the `exports` field in `package.json`.
