#!/bin/bash
set -e

# Initialize database schema and seed on first deploy
node scripts/init-db.js

# Start the Next.js server
npx next start -p ${PORT:-3000}
