#!/bin/bash
set -e

# Run Prisma migrations / push schema to SQLite on persistent volume
npx prisma db push --skip-generate

# Seed database if it's empty (first deploy)
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  if (count === 0) {
    console.log('Empty database detected, seeding...');
    process.exit(1);
  } else {
    console.log('Database already has ' + count + ' users, skipping seed.');
    process.exit(0);
  }
}).catch(() => process.exit(1));
" && echo "Skipping seed" || npx tsx prisma/seed.ts

# Start the Next.js server
node server.js
