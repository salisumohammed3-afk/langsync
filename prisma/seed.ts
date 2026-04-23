import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create company
  const company = await prisma.company.create({
    data: {
      name: "QVC UK",
      brandColour: "#e4002b",
      websiteUrl: "https://www.qvcuk.com",
      industry: "Retail / Ecommerce",
      notes: "QVC UK is a leading multichannel retailer. Key product categories: Beauty, Fashion, Home & Garden, Electronics, Jewellery. Main competitors: John Lewis, Boots, Argos, Amazon UK.",
    },
  });

  // Create users
  const adminHash = await bcrypt.hash("admin123", 12);
  const reviewerHash = await bcrypt.hash("reviewer123", 12);
  const userHash = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Sal Mohammed",
      email: "admin@langsync.ai",
      passwordHash: adminHash,
      role: "admin",
      companyId: company.id,
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      name: "Emma Thompson",
      email: "reviewer@langsync.ai",
      passwordHash: reviewerHash,
      role: "reviewer",
      companyId: company.id,
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "James Wilson",
        email: "james@qvcuk.com",
        passwordHash: userHash,
        role: "challenger",
        teamName: "SEO Team",
        companyId: company.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Sophie Chen",
        email: "sophie@qvcuk.com",
        passwordHash: userHash,
        role: "challenger",
        teamName: "SEO Team",
        companyId: company.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Marcus Johnson",
        email: "marcus@qvcuk.com",
        passwordHash: userHash,
        role: "challenger",
        teamName: "Content Team",
        companyId: company.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Patel",
        email: "priya@qvcuk.com",
        passwordHash: userHash,
        role: "challenger",
        teamName: "Content Team",
        companyId: company.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Tom Richards",
        email: "tom@qvcuk.com",
        passwordHash: userHash,
        role: "challenger",
        teamName: "Digital Team",
        companyId: company.id,
      },
    }),
  ]);

  // Create programme
  const programme = await prisma.programme.create({
    data: {
      title: "90-Day SEO & AEO Challenge",
      description:
        "A 12-week programme to build practical SEO and AEO skills across the QVC UK team. Each week features a hands-on challenge designed to improve search visibility and answer engine optimisation.",
      durationMonths: 3,
      companyId: company.id,
    },
  });

  // Create months
  const month1 = await prisma.month.create({
    data: {
      number: 1,
      theme: "SEO Foundations",
      description: "Build core SEO skills with hands-on challenges covering title tags, meta descriptions, and on-page optimisation.",
      programmeId: programme.id,
    },
  });

  const month2 = await prisma.month.create({
    data: {
      number: 2,
      theme: "Structured Data & Schema",
      description: "Master structured data markup to enhance search appearance and unlock rich results for QVC UK product pages.",
      programmeId: programme.id,
    },
  });

  const month3 = await prisma.month.create({
    data: {
      number: 3,
      theme: "AEO & Answer Engines",
      description: "Optimise for AI-powered answer engines and featured snippets to capture zero-click search traffic.",
      programmeId: programme.id,
    },
  });

  // Create challenges
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  // Month 1 Challenges
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: "Title Tag Audit & Rewrite",
        brief: "Audit the title tags on 5 QVC UK product category pages. For each page, document the current title tag, identify what could be improved, and write a better version.\n\nFocus on:\n- Including the primary keyword near the beginning\n- Keeping under 60 characters\n- Making it compelling for clicks\n- Including the QVC UK brand where appropriate\n\nSubmit your audit as a table with columns: URL, Current Title, Issues, Proposed Title, Character Count.",
        type: "SEO",
        timeEstimate: "30 minutes",
        greatExample: "Here's an example of an excellent title tag audit:\n\nURL: /beauty/skincare\nCurrent: \"Skincare Products - QVC UK\"\nIssues: Generic, doesn't include key category terms, missing value proposition\nProposed: \"Premium Skincare & Beauty Products | Shop QVC UK\"\nChars: 52\n\nNotice how the improved version includes specific category terms, a value proposition (\"Premium\"), and stays well under the 60-character limit while maintaining the brand.",
        competitorExamples: JSON.stringify([
          "John Lewis uses highly specific title tags like \"Moisturisers | Face Skincare | John Lewis & Partners\" (53 chars). Note how they include both the specific product type AND the broader category, creating a clear hierarchy that helps both users and search engines understand the page context.",
          "Boots excels with action-oriented titles: \"Shop Face Moisturisers & Creams | Boots\" (42 chars). The \"Shop\" prefix signals commercial intent and the concise format leaves room for rich snippets in search results.",
        ]),
        unlockDate: new Date(now.getTime() - 6 * weekMs),
        practiceEnabled: true,
        scoringCriteria: "Quality: Are the proposed title tags specific, well-researched, and under 60 characters? Impact: Would these changes genuinely improve click-through rates from search results?",
        weekNumber: 1,
        monthId: month1.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "Meta Description Optimisation",
        brief: "Write compelling meta descriptions for 5 QVC UK pages that currently have missing or poor descriptions.\n\nGuidelines:\n- Keep between 120-155 characters\n- Include a clear call-to-action\n- Incorporate the primary keyword naturally\n- Highlight unique selling points (free delivery, exclusive brands, etc.)\n- Make each description unique to the page\n\nSubmit: URL, Current Description (or 'Missing'), Proposed Description, Character Count.",
        type: "SEO",
        timeEstimate: "30 minutes",
        greatExample: "Great meta description example:\n\nURL: /fashion/dresses\nCurrent: Missing\nProposed: \"Discover stunning dresses for every occasion at QVC UK. From casual day dresses to elegant evening wear. Free P&P on orders over £30. Shop now.\"\nChars: 142\n\nThis works because it uses action words (\"Discover\", \"Shop now\"), mentions specific benefits (free P&P), and covers the breadth of the category.",
        competitorExamples: JSON.stringify([
          "Amazon UK uses benefit-led descriptions: \"Shop Women's Dresses at Amazon.co.uk. Free delivery on eligible orders. Great prices on fashion from top brands.\" They lead with the key action, include free delivery as a hook, and keep it concise.",
        ]),
        unlockDate: new Date(now.getTime() - 5 * weekMs),
        practiceEnabled: true,
        scoringCriteria: "Quality: Are descriptions the right length, compelling, and unique? Impact: Do they include clear CTAs and USPs that would improve click-through rates?",
        weekNumber: 2,
        monthId: month1.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "Internal Linking Strategy",
        brief: "Map the internal linking structure for one QVC UK product category (e.g., Beauty > Skincare > Moisturisers).\n\nDeliverables:\n1. Document the current linking hierarchy (3 levels deep)\n2. Identify orphaned pages or weak links\n3. Propose 5 new internal links that would improve crawlability and distribute page authority\n4. For each proposed link, explain the anchor text and why it helps\n\nThink about: breadcrumb navigation, related products, category cross-links, and content hubs.",
        type: "SEO",
        timeEstimate: "45 minutes",
        greatExample: "Example of a strong internal linking analysis:\n\n1. Current hierarchy: Home > Beauty > Skincare > Moisturisers\n2. Found: 3 orphaned product pages not linked from category page, missing cross-link between Skincare and Beauty Tools\n3. Proposed link: From /beauty/skincare to /beauty/skincare/anti-aging with anchor text \"anti-aging skincare collection\" - this passes topical authority from the parent category to a high-value subcategory.",
        competitorExamples: JSON.stringify([
          "Boots uses a \"Shop by Concern\" cross-linking pattern on category pages, linking Moisturisers to related categories like \"Dry Skin Solutions\" and \"Anti-Aging\". This creates topical clusters that strengthen their authority across related search terms.",
        ]),
        unlockDate: new Date(now.getTime() - 4 * weekMs),
        practiceEnabled: false,
        scoringCriteria: "Quality: Is the analysis thorough and well-structured? Impact: Would the proposed links genuinely improve site architecture and SEO?",
        weekNumber: 3,
        monthId: month1.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "Page Speed Analysis",
        brief: "Run a page speed analysis on 3 QVC UK pages using Google PageSpeed Insights.\n\nFor each page, document:\n1. Current Core Web Vitals scores (LCP, FID/INP, CLS)\n2. Top 3 issues identified by the tool\n3. Recommended fixes ranked by potential impact\n4. Estimated difficulty of implementation (Easy/Medium/Hard)\n\nSubmit a clear summary with actionable recommendations the development team could implement.",
        type: "SEO",
        timeEstimate: "30 minutes",
        greatExample: "Example analysis:\n\nPage: qvcuk.com/beauty\nLCP: 3.2s (Needs Improvement)\nCLS: 0.15 (Needs Improvement)\n\nTop Issues:\n1. Unoptimised images (potential saving: 1.2s LCP) - Easy fix\n2. Render-blocking JavaScript (potential saving: 0.8s) - Medium\n3. Layout shift from lazy-loaded images without dimensions - Easy fix",
        competitorExamples: JSON.stringify([]),
        unlockDate: new Date(now.getTime() - 3 * weekMs),
        practiceEnabled: false,
        scoringCriteria: "Quality: Are the analyses accurate and recommendations specific? Impact: Are recommendations prioritised by ROI?",
        weekNumber: 4,
        monthId: month1.id,
      },
    }),
    // Month 2 Challenges
    prisma.challenge.create({
      data: {
        title: "Product Schema Health Check",
        brief: "Audit the Product schema markup on 3 QVC UK product pages using Google's Rich Results Test.\n\nFor each page:\n1. Document what schema is currently present\n2. Identify missing required and recommended properties\n3. Check for errors or warnings\n4. Write a list of specific improvements needed\n5. Explain how these improvements would affect search appearance\n\nFocus on Product, Offer, AggregateRating, and Review schema types.",
        type: "hybrid",
        timeEstimate: "45 minutes",
        greatExample: "Excellent schema audit:\n\nPage: /product/12345-face-cream\nCurrent schema: Product (name, description, image)\nMissing: offers.price, offers.priceCurrency, aggregateRating, brand, sku\nImpact: Adding price enables price display in search results. Rating stars increase CTR by up to 35%.",
        competitorExamples: JSON.stringify([
          "John Lewis has comprehensive Product schema on every product page including: name, description, image, brand, sku, offers (price, availability, condition), aggregateRating, and review. This enables rich product snippets in Google search with price, availability, and star ratings.",
        ]),
        unlockDate: new Date(now.getTime() - 2 * weekMs),
        practiceEnabled: true,
        scoringCriteria: "Quality: Is the audit thorough and technically accurate? Impact: Would the recommendations unlock rich results?",
        weekNumber: 5,
        monthId: month2.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "FAQ Schema Implementation Plan",
        brief: "Identify 3 QVC UK pages that would benefit from FAQ schema markup.\n\nFor each page:\n1. Explain why FAQ schema is appropriate\n2. Write 3-5 relevant FAQ questions and answers\n3. Describe how the FAQ content should appear on the page\n4. Explain the expected search impact (FAQ rich results, People Also Ask targeting)\n\nThe FAQs should be genuinely useful to customers, not just SEO-driven.",
        type: "AEO",
        timeEstimate: "30 minutes",
        greatExample: "Example:\n\nPage: /beauty/skincare/retinol\nWhy: High information-seeking intent, many PAA questions about retinol\n\nQ: What percentage of retinol should beginners use?\nA: Start with 0.25-0.5% retinol and use 2-3 times per week. Once your skin adjusts (usually 4-6 weeks), you can increase to 1%.\n\nThis targets a specific PAA question while genuinely helping customers make better purchase decisions.",
        competitorExamples: JSON.stringify([
          "Boots uses FAQ schema on ingredient pages (e.g., Hyaluronic Acid, Vitamin C) with questions like \"What does hyaluronic acid do?\" and \"How do I use hyaluronic acid?\". These FAQs appear as expandable sections on the page AND generate FAQ rich results in Google.",
        ]),
        unlockDate: new Date(now.getTime() - 1 * weekMs),
        practiceEnabled: true,
        scoringCriteria: "Quality: Are the FAQs genuinely useful and well-written? Impact: Would they target real search queries and PAA results?",
        weekNumber: 6,
        monthId: month2.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "BreadcrumbList Schema Review",
        brief: "Review the breadcrumb navigation and BreadcrumbList schema on QVC UK.\n\n1. Check 5 pages at different hierarchy levels for BreadcrumbList schema\n2. Document which pages have it and which don't\n3. Identify any errors in the current implementation\n4. Propose improvements to the breadcrumb structure\n5. Explain how proper breadcrumbs improve both UX and search appearance",
        type: "SEO",
        timeEstimate: "30 minutes",
        greatExample: "Strong breadcrumb analysis identifies the complete hierarchy and spots inconsistencies:\n\nHome > Beauty > Skincare > Moisturisers\nSchema present: Yes\nIssue: Missing 'position' property on items 2 and 3\nFix: Add position: 2 for Beauty, position: 3 for Skincare, position: 4 for Moisturisers",
        competitorExamples: JSON.stringify([]),
        unlockDate: new Date(now.getTime()),
        practiceEnabled: false,
        scoringCriteria: "Quality: Is the review thorough across different page types? Impact: Are the fixes specific and implementable?",
        weekNumber: 7,
        monthId: month2.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "HowTo Schema Opportunity Mapping",
        brief: "Identify 3 opportunities for HowTo schema on QVC UK content pages.\n\nFor each opportunity:\n1. Identify the page or content type\n2. Write the HowTo content (steps, tools needed, estimated time)\n3. Explain the search opportunity (target queries, search volume estimate)\n4. Describe the expected rich result appearance",
        type: "hybrid",
        timeEstimate: "30 minutes",
        greatExample: "HowTo opportunity:\n\nPage: /beauty/skincare/how-to-build-skincare-routine\nTarget query: \"how to build a skincare routine\"\nSteps: 1. Cleanse, 2. Tone, 3. Serum, 4. Moisturise, 5. SPF\nEach step links to relevant QVC UK products.\n\nThis creates a rich result showing the steps directly in search results.",
        competitorExamples: JSON.stringify([]),
        unlockDate: new Date(now.getTime() + 1 * weekMs),
        practiceEnabled: true,
        scoringCriteria: "Quality: Are the HowTo ideas well-researched? Impact: Would they capture meaningful search traffic?",
        weekNumber: 8,
        monthId: month2.id,
      },
    }),
    // Month 3 Challenges
    prisma.challenge.create({
      data: {
        title: "Answer Engine Audit",
        brief: "Evaluate how well QVC UK content answers common customer questions compared to AI search engines.\n\n1. Pick a product category (e.g., air fryers, skincare, smart home)\n2. Ask 5 questions about that category to ChatGPT, Perplexity, and Google SGE\n3. Document whether QVC UK is referenced in any answers\n4. Identify gaps: what questions does QVC UK content NOT answer well?\n5. Propose content improvements to become a cited source",
        type: "AEO",
        timeEstimate: "45 minutes",
        greatExample: "Example audit:\n\nCategory: Air Fryers\nQuery: \"Best air fryer for family of 4\"\nChatGPT: Recommends Ninja, Philips, Tefal - no mention of QVC\nPerplexity: Cites John Lewis and Argos comparison pages\n\nGap: QVC has air fryers but no comparison content. Creating a \"Best Air Fryers by Family Size\" guide would position QVC as an authoritative source.",
        competitorExamples: JSON.stringify([
          "John Lewis publishes comprehensive buying guides (\"How to Choose an Air Fryer\") that are frequently cited by AI assistants. These guides compare products by feature, price range, and use case - exactly the format AI engines prefer for sourcing answers.",
        ]),
        unlockDate: new Date(now.getTime() + 2 * weekMs),
        practiceEnabled: true,
        scoringCriteria: "Quality: Is the audit systematic and insights evidence-based? Impact: Are content recommendations actionable and likely to improve AEO visibility?",
        weekNumber: 9,
        monthId: month3.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "Content Gap Analysis for AEO",
        brief: "Using People Also Ask data and AI search engines, identify 10 questions that QVC UK should be answering but currently isn't.\n\nFor each question:\n1. The exact question\n2. Where you found it (PAA, ChatGPT, Perplexity)\n3. Current top answer source\n4. Proposed QVC UK content to answer it\n5. Which page it should live on",
        type: "AEO",
        timeEstimate: "45 minutes",
        greatExample: "Example:\n\nQuestion: \"Is QVC genuine products?\"\nSource: Google PAA\nCurrent answer: Trustpilot reviews, Reddit threads\nProposed: Create an \"Authenticity Guarantee\" page with brand partnerships info\nPage: /about/authenticity-guarantee",
        competitorExamples: JSON.stringify([]),
        unlockDate: new Date(now.getTime() + 3 * weekMs),
        practiceEnabled: false,
        scoringCriteria: "Quality: Are the questions real and relevant? Impact: Would answering them improve QVC's visibility in AI search?",
        weekNumber: 10,
        monthId: month3.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "Featured Snippet Capture Strategy",
        brief: "Identify 5 featured snippet opportunities for QVC UK.\n\nFor each opportunity:\n1. Target query and current snippet holder\n2. Snippet type (paragraph, list, table)\n3. Why QVC UK can win this snippet\n4. Exact content format needed (word count, structure)\n5. Which page to optimise or create",
        type: "hybrid",
        timeEstimate: "30 minutes",
        greatExample: "Snippet opportunity:\n\nQuery: \"how to choose foundation shade\"\nCurrent holder: Boots (paragraph snippet)\nType: List format would work better\nQVC opportunity: Create a step-by-step guide on the Beauty category hub\nContent: 5-step numbered list, each step 20-30 words, with product links",
        competitorExamples: JSON.stringify([]),
        unlockDate: new Date(now.getTime() + 4 * weekMs),
        practiceEnabled: true,
        scoringCriteria: "Quality: Are the snippet opportunities realistic? Impact: Would winning these snippets drive meaningful traffic?",
        weekNumber: 11,
        monthId: month3.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "90-Day SEO/AEO Action Plan",
        brief: "Create a prioritised 90-day action plan for QVC UK based on everything you've learned in this programme.\n\nYour plan should include:\n1. Top 5 quick wins (can be implemented this week)\n2. Top 5 medium-term projects (1-4 weeks)\n3. Top 3 strategic initiatives (1-3 months)\n\nFor each item: describe the action, estimate the effort, predict the impact, and explain your reasoning based on what you've discovered in the challenges.",
        type: "hybrid",
        timeEstimate: "60 minutes",
        greatExample: "Example quick win:\n\nAction: Fix missing Product schema on top 50 product pages\nEffort: 2 days development time\nImpact: Enables rich product results for highest-traffic pages\nReasoning: In the Schema Health Check challenge, I found that 60% of top product pages are missing price and rating schema, which competitors all have.",
        competitorExamples: JSON.stringify([]),
        unlockDate: new Date(now.getTime() + 5 * weekMs),
        practiceEnabled: true,
        scoringCriteria: "Quality: Is the plan comprehensive and well-reasoned? Impact: Does it prioritise by ROI and build on genuine insights from the programme?",
        weekNumber: 12,
        monthId: month3.id,
      },
    }),
  ]);

  // Create sample submissions for demo purposes
  const submissionData = [
    {
      userId: users[0].id,
      challengeId: challenges[0].id,
      content: "Title Tag Audit for QVC UK Category Pages:\n\n1. /beauty/skincare\nCurrent: \"Skincare - QVC UK\"\nIssues: Too generic, no value prop\nProposed: \"Premium Skincare Products & Brands | QVC UK\" (46 chars)\n\n2. /fashion/dresses\nCurrent: \"Dresses | QVC\"\nIssues: Missing UK, no descriptors\nProposed: \"Shop Women's Dresses - Casual to Evening | QVC UK\" (51 chars)\n\n3. /home/kitchen\nCurrent: \"Kitchen - Home - QVC UK\"\nIssues: Redundant hierarchy, not compelling\nProposed: \"Kitchen Appliances & Cookware | Free P&P | QVC UK\" (51 chars)\n\n4. /electronics/smart-home\nCurrent: \"Smart Home\"\nIssues: No brand, extremely generic\nProposed: \"Smart Home Devices & Automation | Shop QVC UK\" (47 chars)\n\n5. /jewellery/rings\nCurrent: \"Rings - Jewellery - QVC UK\"\nIssues: Boring hierarchy format\nProposed: \"Diamond & Gemstone Rings | Fine Jewellery | QVC UK\" (52 chars)",
      status: "reviewed",
      completionScore: 1,
      qualityScore: 3,
      impactScore: 2,
      reviewerFeedback: "Excellent audit! Your proposed titles are specific, well-researched, and all under 60 characters. The kitchen page suggestion with 'Free P&P' is a great touch for CTR.",
    },
    {
      userId: users[1].id,
      challengeId: challenges[0].id,
      content: "Audit of 5 QVC UK title tags:\n\n1. /beauty - Current: \"Beauty\" - Proposed: \"Beauty Products & Brands | QVC UK\" (35 chars)\n2. /fashion - Current: \"Fashion\" - Proposed: \"Women's Fashion & Clothing | QVC UK\" (37 chars)\n3. /home - Current: \"Home\" - Proposed: \"Home & Garden Products | QVC UK\" (33 chars)\n4. /electronics - Current: \"Electronics\" - Proposed: \"Electronics & Gadgets | QVC UK\" (32 chars)\n5. /jewellery - Current: \"Jewellery\" - Proposed: \"Fine Jewellery & Watches | QVC UK\" (35 chars)",
      status: "reviewed",
      completionScore: 1,
      qualityScore: 2,
      impactScore: 2,
      reviewerFeedback: "Good start but the proposed titles could be more specific and compelling. Consider adding USPs or more descriptive category terms.",
    },
    {
      userId: users[2].id,
      challengeId: challenges[0].id,
      content: "Title tag audit completed for 5 pages. All current titles are too short and generic. Proposed improvements focus on adding keywords and brand name.",
      status: "reviewed",
      completionScore: 1,
      qualityScore: 1,
      impactScore: 1,
      reviewerFeedback: "The submission is too brief. Please provide specific URLs, current titles, and detailed proposed titles with character counts.",
    },
    {
      userId: users[0].id,
      challengeId: challenges[1].id,
      content: "Meta Description Audit:\n\n1. /beauty/skincare/moisturisers\nCurrent: Missing\nProposed: \"Discover luxurious moisturisers from top brands at QVC UK. From lightweight gels to rich night creams. Free P&P on orders over £30. Shop now.\" (141 chars)\n\n2. /fashion/dresses/occasion\nCurrent: \"QVC UK Occasion Dresses\"\nProposed: \"Find your perfect occasion dress at QVC UK. Wedding guest, party & formal styles from exclusive designers. Easy returns & flexible payments.\" (139 chars)\n\n3. /home/kitchen/air-fryers\nCurrent: Missing\nProposed: \"Shop the best air fryers at QVC UK. Ninja, Tefal & more top brands. Healthier cooking made easy. Free delivery on selected models.\" (130 chars)",
      status: "reviewed",
      completionScore: 1,
      qualityScore: 3,
      impactScore: 3,
      reviewerFeedback: "Outstanding work! Each description is unique, includes CTAs, highlights USPs, and is perfectly within the character limit. The air fryer description is particularly strong.",
    },
    {
      userId: users[3].id,
      challengeId: challenges[0].id,
      content: "Title Tag Review:\n\n1. /beauty/makeup/foundation\nCurrent: \"Foundation - Makeup - Beauty - QVC UK\" (38 chars)\nIssues: Redundant breadcrumb format, wastes characters\nProposed: \"Shop Foundation & Concealer | Top Beauty Brands | QVC UK\" (56 chars)\n\n2. /fashion/coats\nCurrent: \"Coats - Fashion - QVC UK\" (26 chars)\nIssues: Generic, no season or style context\nProposed: \"Women's Coats & Jackets | Winter Styles | QVC UK\" (49 chars)\n\n3. /electronics/tablets\nCurrent: \"Tablets | QVC\"\nIssues: Missing UK, too short\nProposed: \"Tablets & iPads | Samsung, Apple & More | QVC UK\" (49 chars)\n\n4. /home/bedding\nCurrent: \"Bedding - Home - QVC UK\" (25 chars)\nProposed: \"Luxury Bedding Sets & Duvets | Shop QVC UK\" (43 chars)\n\n5. /beauty/fragrance\nCurrent: \"Fragrance | QVC UK\" (20 chars)\nProposed: \"Designer Perfumes & Fragrances | QVC UK\" (40 chars)",
      status: "submitted",
      completionScore: 1,
      qualityScore: null,
      impactScore: null,
    },
    {
      userId: users[4].id,
      challengeId: challenges[0].id,
      content: "QVC UK Title Tag Audit:\n\n1. /beauty/skincare/serums\nCurrent: \"Serums\" (7 chars)\nProposed: \"Face Serums & Treatments | Skincare | QVC UK\" (45 chars)\n\n2. /fashion/activewear\nCurrent: \"Activewear - QVC UK\" (21 chars)\nProposed: \"Women's Activewear & Gym Clothing | QVC UK\" (43 chars)\n\n3. /home/smart-home/speakers\nCurrent: \"Speakers\" (10 chars)\nProposed: \"Smart Speakers & Voice Assistants | QVC UK\" (43 chars)\n\n4. /jewellery/necklaces\nCurrent: \"Necklaces | QVC UK\" (20 chars)\nProposed: \"Gold & Silver Necklaces | Fine Jewellery | QVC UK\" (50 chars)\n\n5. /electronics/cameras\nCurrent: \"Cameras - QVC UK\" (18 chars)\nProposed: \"Digital Cameras & Photography | Shop QVC UK\" (44 chars)",
      status: "submitted",
      completionScore: 1,
      qualityScore: null,
      impactScore: null,
    },
  ];

  for (const sub of submissionData) {
    await prisma.submission.create({ data: sub });
  }

  // Create a sample conversation
  await prisma.conversation.create({
    data: {
      userId: users[0].id,
      challengeId: challenges[0].id,
      messages: JSON.stringify([
        {
          role: "user",
          content: "What makes a good title tag for an ecommerce category page?",
          timestamp: new Date(now.getTime() - 5 * weekMs).toISOString(),
        },
        {
          role: "assistant",
          content: "Great question! A strong ecommerce category title tag should:\n\n1. **Be under 60 characters** to avoid truncation\n2. **Include the primary keyword** near the beginning\n3. **Be compelling** - think about what makes someone click\n4. **Include the brand** (QVC UK) for recognition\n5. **Add a USP** if space allows (e.g., \"Free P&P\", \"Exclusive Brands\")\n\nFor QVC UK specifically, consider what differentiates your categories from competitors like John Lewis or Boots. What category are you looking at?",
          timestamp: new Date(now.getTime() - 5 * weekMs).toISOString(),
        },
      ]),
    },
  });

  console.log("Seed completed!");
  console.log("\nDemo accounts:");
  console.log("  Admin:    admin@langsync.ai / admin123");
  console.log("  Reviewer: reviewer@langsync.ai / reviewer123");
  console.log("  Users:    james@qvcuk.com / user123");
  console.log("            sophie@qvcuk.com / user123");
  console.log("            marcus@qvcuk.com / user123");
  console.log("            priya@qvcuk.com / user123");
  console.log("            tom@qvcuk.com / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
