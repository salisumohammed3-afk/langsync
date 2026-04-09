// This script initializes the database on first deploy.
// It pushes the Prisma schema and seeds data if the DB is empty.
const { execSync } = require('child_process');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'node_modules', '.bin');

try {
  console.log('Pushing database schema...');
  execSync(`${path.join(prismaDir, 'prisma')} db push --skip-generate`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('Schema pushed successfully.');
} catch (e) {
  console.error('Failed to push schema:', e.message);
  process.exit(1);
}

// Check if seeding is needed
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count === 0) {
    console.log('Empty database — seeding...');
    // Inline seed logic
    const bcrypt = require('bcryptjs');

    const hash = (pw) => bcrypt.hashSync(pw, 10);

    const company = await prisma.company.create({
      data: {
        name: 'QVC UK',
        brandColour: '#e4002b',
        websiteUrl: 'https://www.qvcuk.com',
        industry: 'Retail / E-commerce',
        notes: 'Multi-platform retailer reaching millions of customers across TV, web, and mobile.',
      },
    });

    const adminUser = await prisma.user.create({
      data: { name: 'Admin User', email: 'admin@langsync.ai', passwordHash: hash('admin123'), role: 'admin', companyId: company.id },
    });
    await prisma.user.create({
      data: { name: 'Review Manager', email: 'reviewer@langsync.ai', passwordHash: hash('reviewer123'), role: 'reviewer', companyId: company.id },
    });
    const users = [];
    const challengers = [
      { name: 'James Wilson', email: 'james@qvcuk.com', teamName: 'Content Team' },
      { name: 'Sophie Chen', email: 'sophie@qvcuk.com', teamName: 'Content Team' },
      { name: 'Marcus Johnson', email: 'marcus@qvcuk.com', teamName: 'SEO Team' },
      { name: 'Priya Patel', email: 'priya@qvcuk.com', teamName: 'SEO Team' },
      { name: 'Tom Baker', email: 'tom@qvcuk.com', teamName: 'Marketing Team' },
    ];
    for (const c of challengers) {
      const u = await prisma.user.create({
        data: { ...c, passwordHash: hash('user123'), role: 'challenger', companyId: company.id },
      });
      users.push(u);
    }

    const programme = await prisma.programme.create({
      data: { title: '90-Day SEO & AEO Challenge', description: 'A structured 90-day programme to transform QVC UK search visibility.', durationMonths: 3, companyId: company.id },
    });

    const months = [];
    const monthData = [
      { number: 1, theme: 'SEO Foundations', description: 'Master the fundamentals of on-page SEO.' },
      { number: 2, theme: 'Structured Data & Schema', description: 'Implement structured data for rich results.' },
      { number: 3, theme: 'AEO & Answer Engines', description: 'Optimise for AI-powered search.' },
    ];
    for (const m of monthData) {
      const month = await prisma.month.create({ data: { ...m, programmeId: programme.id } });
      months.push(month);
    }

    const now = new Date();
    const challengeData = [
      { title: 'Title Tag Audit', brief: 'Audit and optimise title tags for QVC UK top 20 category pages.', type: 'SEO', monthId: months[0].id, weekNumber: 1, unlockDate: new Date(now.getTime() - 21 * 86400000), practiceEnabled: true, timeEstimate: '45 minutes' },
      { title: 'Meta Description Optimisation', brief: 'Write compelling meta descriptions for QVC UK product categories.', type: 'SEO', monthId: months[0].id, weekNumber: 2, unlockDate: new Date(now.getTime() - 14 * 86400000), practiceEnabled: true, timeEstimate: '30 minutes' },
      { title: 'Internal Linking Strategy', brief: 'Design an internal linking strategy for QVC UK top categories.', type: 'SEO', monthId: months[0].id, weekNumber: 3, unlockDate: new Date(now.getTime() - 7 * 86400000), practiceEnabled: true, timeEstimate: '60 minutes' },
      { title: 'Page Speed Analysis', brief: 'Analyse and recommend page speed improvements for QVC UK.', type: 'SEO', monthId: months[0].id, weekNumber: 4, unlockDate: new Date(now.getTime() - 1 * 86400000), practiceEnabled: false, timeEstimate: '45 minutes' },
      { title: 'Product Schema Markup', brief: 'Implement Product schema for QVC UK product pages.', type: 'hybrid', monthId: months[1].id, weekNumber: 5, unlockDate: new Date(now.getTime() + 7 * 86400000), practiceEnabled: true, timeEstimate: '60 minutes' },
      { title: 'FAQ Schema', brief: 'Create FAQ schema markup for QVC UK help pages.', type: 'AEO', monthId: months[1].id, weekNumber: 6, unlockDate: new Date(now.getTime() + 14 * 86400000), practiceEnabled: true, timeEstimate: '45 minutes' },
      { title: 'BreadcrumbList Schema', brief: 'Implement BreadcrumbList structured data across QVC UK.', type: 'hybrid', monthId: months[1].id, weekNumber: 7, unlockDate: new Date(now.getTime() + 21 * 86400000), practiceEnabled: false, timeEstimate: '30 minutes' },
      { title: 'HowTo Schema', brief: 'Add HowTo schema to QVC UK buying guides.', type: 'AEO', monthId: months[1].id, weekNumber: 8, unlockDate: new Date(now.getTime() + 28 * 86400000), practiceEnabled: true, timeEstimate: '45 minutes' },
      { title: 'Answer Engine Audit', brief: 'Audit QVC UK presence in AI-powered answer engines.', type: 'AEO', monthId: months[2].id, weekNumber: 9, unlockDate: new Date(now.getTime() + 35 * 86400000), practiceEnabled: true, timeEstimate: '60 minutes' },
      { title: 'Content Gap Analysis', brief: 'Identify content gaps for QVC UK vs competitors.', type: 'hybrid', monthId: months[2].id, weekNumber: 10, unlockDate: new Date(now.getTime() + 42 * 86400000), practiceEnabled: true, timeEstimate: '60 minutes' },
      { title: 'Featured Snippet Strategy', brief: 'Develop a featured snippet capture strategy for QVC UK.', type: 'AEO', monthId: months[2].id, weekNumber: 11, unlockDate: new Date(now.getTime() + 49 * 86400000), practiceEnabled: false, timeEstimate: '45 minutes' },
      { title: '90-Day Action Plan', brief: 'Create a comprehensive 90-day SEO & AEO action plan for QVC UK.', type: 'hybrid', monthId: months[2].id, weekNumber: 12, unlockDate: new Date(now.getTime() + 56 * 86400000), practiceEnabled: true, timeEstimate: '90 minutes' },
    ];

    const challenges = [];
    for (const cd of challengeData) {
      const ch = await prisma.challenge.create({ data: cd });
      challenges.push(ch);
    }

    // Sample submissions
    await prisma.submission.create({
      data: { content: 'Audited top 20 category pages...', status: 'reviewed', completionScore: 1, qualityScore: 3, impactScore: 2, userId: users[0].id, challengeId: challenges[0].id, reviewedAt: new Date() },
    });
    await prisma.submission.create({
      data: { content: 'Optimised meta descriptions...', status: 'reviewed', completionScore: 1, qualityScore: 2, impactScore: 2, userId: users[1].id, challengeId: challenges[0].id, reviewedAt: new Date() },
    });
    await prisma.submission.create({
      data: { content: 'Meta descriptions for all categories...', status: 'submitted', completionScore: 1, userId: users[0].id, challengeId: challenges[1].id },
    });
    await prisma.submission.create({
      data: { content: 'Internal linking analysis complete...', status: 'reviewed', completionScore: 1, qualityScore: 3, impactScore: 3, userId: users[2].id, challengeId: challenges[0].id, reviewedAt: new Date() },
    });
    await prisma.submission.create({
      data: { content: 'Page speed analysis report...', status: 'submitted', completionScore: 1, userId: users[3].id, challengeId: challenges[1].id },
    });

    console.log('Seed completed!');
  } else {
    console.log(`Database has ${count} users, skipping seed.`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
