#!/bin/bash
# Bootstrap a new project from the never-code template.
# Usage: ./setup.sh
#
# Does everything: install, .env, database, loop state.
# Run once after cloning. Idempotent — safe to re-run.

set -euo pipefail

echo "=== never-code setup ==="

# 1. Install dependencies
echo "Installing dependencies..."
pnpm install

# 2. Create .env from .env.example if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
else
  echo ".env already exists, skipping"
fi

# Load DATABASE_URL from .env for subsequent commands
set -a
source .env
set +a

# 3. Start postgres
echo "Starting postgres..."
docker compose up -d --wait

# 4. Run migrations
echo "Running migrations..."
pnpm db:migrate

# 5. Seed database
echo "Seeding database..."
pnpm db:seed

# 6. Run quality gates to verify everything works
echo "Running quality gates..."
pnpm check

# 7. Initialize the autonomous loop
if [ -f loop-state.json ]; then
  echo "loop-state.json already exists, skipping loop init"
else
  echo "Initializing autonomous loop from vision.md..."
  node .claude/hooks/init-loop.mjs
fi

echo ""
echo "=== Setup complete ==="
echo ""
echo "To start the autonomous loop:"
echo "  claude"
echo ""
echo "The stop hook will score features and start building."
echo "Ctrl+C to stop. Edit loop-state.json to set phase to 'idle' for graceful exit."
