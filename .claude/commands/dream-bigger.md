Vision and roadmap generator. Run this when there are no features left to implement.

## Phase 1: Read the Vision [AGENT]

1. Check if `vision.md` exists at the project root.
   - If YES: read it. This is the north star.
   - If NO: create it by asking the user:
     - "What is this project trying to become?"
     - "Who is it for?"
     - "What would make someone say 'this is amazing'?"
     Write their answers into `vision.md` and commit it.

## Phase 2: Audit Current State [AGENT]

2. Read the codebase. For each app/package, summarize:
   - What exists (features, pages, API endpoints)
   - What's tested (unit, integration, E2E coverage)
   - What's missing or incomplete

3. Read `experiments.tsv` — what has been tried, kept, discarded?

4. Read `git log --oneline -50` — what's the trajectory?

## Phase 3: Research [AGENT]

5. Search the web for similar projects, competitors, and inspiration:
   - Search Reddit (r/webdev, r/typescript, r/nextjs, r/selfhosted) for similar projects
   - Search GitHub for repos with overlapping goals
   - Search Hacker News for discussions about this type of project
   - Look for "awesome-*" lists in the relevant domain

6. For each interesting finding, note:
   - What they do well that we don't
   - Features users are asking for
   - Common pain points people mention
   - Ideas that got strong community reactions

## Phase 4: Dream [AGENT]

7. Based on the vision, current state, and research, generate:

   **Quick Wins** (can implement in one `/ralph` session):
   - 3-5 small features or improvements that would make the project noticeably better

   **Big Bets** (multi-session, high impact):
   - 2-3 ambitious features that would differentiate this project

   **Moonshots** (stretch goals, potentially transformative):
   - 1-2 ideas that would make people say "whoa"

For each idea, include:
- One-line description
- Why it matters (user value)
- Rough scope (files/packages affected)
- Inspiration source (if from research)

## Phase 5: Propose [AGENT]

8. Present the roadmap to the user. Ask:
   - "Which of these excites you most?"
   - "Anything I missed? Anything to cut?"
   - "Should I start with a quick win or go big?"

9. Update `vision.md` with the agreed roadmap.
10. Commit: `git add vision.md && git commit -m "docs: update vision and roadmap"`

11. When the user picks a feature: invoke `/ralph` to build it.

## Rules
- ALWAYS research before proposing. Don't just brainstorm in a vacuum.
- Ground every idea in either user value or competitive advantage.
- Be ambitious but honest about scope.
- The vision.md is a living document — update it, don't just append.
