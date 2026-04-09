#!/bin/bash
set -e

echo "Starting LangSync app..."
echo "DATABASE_URL: $DATABASE_URL"
echo "Checking /data directory..."
ls -la /data/ 2>/dev/null || echo "/data directory not accessible"

# Initialize database schema and seed on first deploy
node scripts/init-db.js

echo "Database initialized. Starting Next.js..."
# Start the Next.js server
npx next start -p ${PORT:-3000}
