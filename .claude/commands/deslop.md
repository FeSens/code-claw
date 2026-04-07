Clean up AI-generated code bloat. Deletion-first, regression-safe.

## Steps

1. [DETERMINISTIC] Run `pnpm check` — establish passing baseline. If already failing, STOP. Fix first.

2. [DETERMINISTIC] `git diff main...HEAD --stat` — see what changed since main.

3. [AGENT] For each changed file, review for slop:
   - **Dead code**: unused functions, unreachable branches, commented-out code
   - **Over-abstraction**: helper functions called once, unnecessary wrapper classes, premature generalization
   - **Redundant types**: types that duplicate Zod inferred types, interfaces that mirror existing ones
   - **Unnecessary comments**: comments that restate the code, JSDoc on obvious functions
   - **Verbose patterns**: 10 lines that could be 3, intermediate variables that obscure intent

4. [AGENT] Delete the slop. Be aggressive — if in doubt, delete it.

5. [DETERMINISTIC] `pnpm check` — verify nothing broke. If it did:
   - `git checkout -- <file>` to restore the broken file
   - Try a less aggressive cleanup of that file
   - Re-run `pnpm check`

6. [DETERMINISTIC] If cleanup was made, commit:
   ```
   git add -A && git commit -m "refactor: deslop — remove AI-generated bloat"
   ```

## Rules
- NEVER add code in a deslop pass. Only delete or simplify.
- NEVER change behavior. Tests must still pass identically.
- Fewer lines, fewer files, fewer abstractions = better.
- If a file has less than 10 lines after cleanup, consider inlining its exports into the consumer.
