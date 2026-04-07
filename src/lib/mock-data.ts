import { v4 as uuid } from 'uuid';
import type {
  CompanyResearch,
  Persona,
  Idea,
  IdeaDetail,
  DimensionKey,
  StarLevel,
  ModelSource,
} from '@/types';

// ── Company Research Mock ──

export function generateMockResearch(companyName: string, url?: string): CompanyResearch {
  return {
    value_proposition: `${companyName} provides an innovative platform that combines cutting-edge technology with user-centric design to deliver exceptional value to its customers.`,
    target_market: 'Mid-market and enterprise companies looking to scale their operations with modern tooling and seamless integrations.',
    product_surfaces: [
      'Web application (primary)',
      'Mobile companion app',
      'API & developer platform',
      'Admin dashboard',
    ],
    key_journeys: [
      'New user onboarding and first-value experience',
      'Core workflow execution and task completion',
      'Team collaboration and sharing',
      'Billing, subscription management, and upgrades',
      'Support and issue resolution',
    ],
    summary: `${companyName} operates in a competitive market with strong product-market fit. Their core offering centres around ${url ? `their platform at ${url}` : 'their digital product'}, serving teams that need reliable, fast, and intuitive tooling. Key strengths include developer experience and integration ecosystem. Key gaps include emotional onboarding moments and post-purchase delight.`,
  };
}

// ── Persona Generation Mock ──

const PERSONA_TEMPLATES: Omit<Persona, 'id' | 'analysis_id' | 'scores'>[] = [
  { name: 'Sarah Chen', emoji: '👩‍💼', role: 'VP of Product', description: 'Senior leader who evaluates tools for strategic fit. Cares about ROI, team adoption, and executive reporting.' },
  { name: 'Marcus Johnson', emoji: '👨‍💻', role: 'Lead Developer', description: 'Technical decision-maker who builds integrations. Values API quality, documentation, and performance.' },
  { name: 'Priya Sharma', emoji: '👩‍🎨', role: 'UX Designer', description: 'Advocates for user experience. Notices every friction point and judges products by their attention to detail.' },
  { name: 'David Kim', emoji: '📊', role: 'Data Analyst', description: 'Power user who pushes products to their limits. Needs advanced features, export capabilities, and reliability.' },
  { name: 'Emma Wilson', emoji: '🤝', role: 'Customer Success Manager', description: 'Represents the voice of the customer. Sees pain points that internal teams miss.' },
  { name: 'Alex Rivera', emoji: '💰', role: 'CFO', description: 'Controls budget. Evaluates total cost of ownership, competitive alternatives, and measurable outcomes.' },
  { name: 'Tomoko Nakamura', emoji: '🔄', role: 'Churned Customer', description: 'Left for a competitor 6 months ago. Has specific reasons and unmet needs that drove the switch.' },
  { name: 'Jordan Blake', emoji: '🌍', role: 'Industry Outsider', description: 'Comes from a completely different sector. Brings fresh perspective on what "great" looks like.' },
];

const DIMENSION_KEYS: DimensionKey[] = [
  'customer_experience',
  'product',
  'sales_growth',
  'operations',
  'brand_trust',
];

function generatePersonaScores(userScores: Partial<Record<DimensionKey, number>>): Record<DimensionKey, number> {
  const scores: Partial<Record<DimensionKey, number>> = {};
  for (const key of DIMENSION_KEYS) {
    const base = userScores[key] ?? 5;
    const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
    scores[key] = Math.max(1, Math.min(10, base + variance));
  }
  return scores as Record<DimensionKey, number>;
}

export function generateMockPersonas(
  analysisId: string,
  userScores: Partial<Record<DimensionKey, number>>
): Persona[] {
  return PERSONA_TEMPLATES.map((template) => ({
    ...template,
    id: uuid(),
    analysis_id: analysisId,
    scores: generatePersonaScores(userScores),
  }));
}

// ── Idea Generation Mock ──

interface IdeaTemplate {
  title: string;
  description: string;
  model_source: ModelSource;
  dimension_key: DimensionKey;
  confidence: 'novel' | 'balanced' | 'feasible';
}

const IDEAS_BY_TIER: Record<StarLevel, IdeaTemplate[]> = {
  6: [
    { title: 'Personalised Onboarding Micro-Wins', description: 'Send a celebratory micro-animation and personalised message after each key onboarding milestone. Track completion with a visual progress ring that fills with the brand colour.', model_source: 'gemini', dimension_key: 'customer_experience', confidence: 'feasible' },
    { title: 'Smart Default Configurations', description: 'Analyse the user\'s industry and team size during signup to pre-configure dashboards, templates, and workflows. Eliminate the "blank canvas" problem entirely.', model_source: 'chatgpt', dimension_key: 'product', confidence: 'feasible' },
    { title: 'Revenue Attribution Dashboard', description: 'Build a self-serve dashboard showing customers exactly how much revenue or time your product has saved them. Auto-calculate ROI using their actual usage data.', model_source: 'claude', dimension_key: 'sales_growth', confidence: 'balanced' },
    { title: 'Proactive Health Notifications', description: 'Monitor system performance from the customer\'s perspective. Alert them before they notice issues, with a clear status page showing your response time and resolution history.', model_source: 'claude', dimension_key: 'operations', confidence: 'feasible' },
    { title: 'Customer Spotlight Programme', description: 'Feature one customer per month across your channels — LinkedIn, newsletter, podcast. Position them as innovators, not just users. Give them a story to tell.', model_source: 'gemini', dimension_key: 'brand_trust', confidence: 'feasible' },
    { title: 'Contextual Help Tooltips', description: 'Add non-intrusive, context-aware tooltips that appear based on user behaviour patterns, not just feature discovery. Reduce support tickets by 30%.', model_source: 'chatgpt', dimension_key: 'customer_experience', confidence: 'feasible' },
  ],
  7: [
    { title: 'AI-Powered Customer Journey Replay', description: 'Record and replay any customer\'s journey through your product with AI annotations highlighting confusion points, rage clicks, and delight moments. Like a Loom for product analytics.', model_source: 'gemini', dimension_key: 'customer_experience', confidence: 'balanced' },
    { title: 'Competitive Intelligence Autopilot', description: 'Continuously monitor competitor products, pricing, and messaging. Auto-generate battlecards for your sales team with weekly diffs of what changed and why it matters.', model_source: 'claude', dimension_key: 'sales_growth', confidence: 'balanced' },
    { title: 'Self-Healing Infrastructure', description: 'Build an operations layer that detects anomalies, automatically rolls back problematic deployments, and spins up additional capacity before usage spikes. Inspired by Netflix\'s Chaos Engineering.', model_source: 'claude', dimension_key: 'operations', confidence: 'novel' },
    { title: 'Product-Led Community Platform', description: 'Embed a community layer directly inside your product. Users can share workflows, templates, and tips without leaving the app. Top contributors get featured in a public Hall of Fame.', model_source: 'chatgpt', dimension_key: 'brand_trust', confidence: 'balanced' },
    { title: 'Modular Plugin Marketplace', description: 'Launch a marketplace where third-party developers build and sell extensions. Revenue share model incentivises ecosystem growth. Your product becomes a platform.', model_source: 'chatgpt', dimension_key: 'product', confidence: 'balanced' },
    { title: 'Predictive Churn Intervention', description: 'Use ML to identify accounts showing churn signals 45 days before cancellation. Trigger personalised outreach sequences combining product tips, success stories, and executive check-ins.', model_source: 'gemini', dimension_key: 'sales_growth', confidence: 'balanced' },
  ],
  8: [
    { title: 'Zero-Setup Enterprise Deployment', description: 'Build a deployment system so sophisticated that enterprise customers go from "signed contract" to "fully configured for 10,000 users" in under 4 hours. No professional services needed.', model_source: 'chatgpt', dimension_key: 'operations', confidence: 'novel' },
    { title: 'Ambient Intelligence Layer', description: 'Your product anticipates what the user needs before they ask. Like a brilliant colleague who always has the right document, data point, or suggestion ready at the perfect moment.', model_source: 'gemini', dimension_key: 'customer_experience', confidence: 'novel' },
    { title: 'Open-Source Your Secret Sauce', description: 'Take your most loved internal tool and open-source it. Build developer goodwill, attract engineering talent, and establish technical authority. Inspired by Facebook releasing React.', model_source: 'claude', dimension_key: 'brand_trust', confidence: 'novel' },
    { title: 'Customer-Funded R&D Programme', description: 'Let customers invest in specific features they want built. They get early access, priority support, and their logo on the feature page. Aligns roadmap with willingness to pay.', model_source: 'chatgpt', dimension_key: 'sales_growth', confidence: 'balanced' },
    { title: 'Cross-Product Data Fabric', description: 'Build connectors so deep that your product becomes the single source of truth across the customer\'s entire stack. Data flows in, intelligence flows out. Switching cost becomes infinite.', model_source: 'claude', dimension_key: 'product', confidence: 'novel' },
    { title: 'Real-Time Sentiment Dashboard', description: 'Aggregate every customer touchpoint — support tickets, NPS, social mentions, usage patterns — into a single emotional health score per account. Surface the "why" behind every number.', model_source: 'gemini', dimension_key: 'customer_experience', confidence: 'balanced' },
  ],
  9: [
    { title: 'Industry Operating System', description: 'Evolve from a product to the operating system for your entire industry. Every workflow, every data point, every decision flows through your platform. You don\'t compete — you define the category.', model_source: 'chatgpt', dimension_key: 'product', confidence: 'novel' },
    { title: 'Autonomous Customer Success', description: 'An AI agent that manages the entire customer relationship. It onboards, trains, troubleshoots, upsells, and delights — better than the best human CSM. Available 24/7 in every language.', model_source: 'gemini', dimension_key: 'customer_experience', confidence: 'novel' },
    { title: 'The Guarantee That Changes Everything', description: 'Offer a guarantee so bold it reshapes customer expectations for the entire industry. "If you don\'t see 3x ROI in 90 days, we pay you $10,000." Back it with data, not bravado.', model_source: 'claude', dimension_key: 'sales_growth', confidence: 'novel' },
    { title: 'Cognitive Digital Twin', description: 'Build a digital twin of each customer\'s business inside your platform. Simulate changes, predict outcomes, and test strategies before deploying them in the real world. Inspired by aerospace engineering.', model_source: 'claude', dimension_key: 'operations', confidence: 'novel' },
    { title: 'Cultural Movement, Not Marketing', description: 'Transcend "brand" entirely. Create a movement that people identify with — a philosophy, a community, a way of working. Your product is just the vehicle. Think Patagonia, not Salesforce.', model_source: 'gemini', dimension_key: 'brand_trust', confidence: 'novel' },
    { title: 'Universal API Standard', description: 'Propose and steward an open standard for your industry\'s data interchange format. Become the IETF of your space. Competitors build on your standard. You wrote the rules.', model_source: 'chatgpt', dimension_key: 'brand_trust', confidence: 'novel' },
  ],
};

export function generateMockIdeas(analysisId: string): Idea[] {
  const ideas: Idea[] = [];
  for (const [level, templates] of Object.entries(IDEAS_BY_TIER)) {
    for (const template of templates) {
      ideas.push({
        id: uuid(),
        analysis_id: analysisId,
        star_level: Number(level) as StarLevel,
        title: template.title,
        description: template.description,
        model_source: template.model_source,
        lens: MODELS_LENS[template.model_source],
        dimension_key: template.dimension_key,
        confidence: template.confidence,
      });
    }
  }
  return ideas;
}

const MODELS_LENS: Record<ModelSource, string> = {
  claude: 'Cross-Industry Analogies',
  chatgpt: 'Unlimited Budget',
  gemini: 'Emotional Moment Mapping',
};

// ── Idea Detail Mock ──

export function generateMockIdeaDetail(idea: Idea): IdeaDetail {
  return {
    id: uuid(),
    idea_id: idea.id,
    what_it_takes: generateWhatItTakes(idea),
    regression_version: generateRegressionVersion(idea),
  };
}

function generateWhatItTakes(idea: Idea): string {
  const complexity = idea.star_level <= 7 ? 'moderate' : 'high';
  const timeline = idea.star_level <= 7 ? '6-12 weeks' : '3-6 months';
  const team = idea.star_level <= 7 ? '2-3 engineers, 1 designer' : '5-8 engineers, 2 designers, 1 PM';

  return `**Complexity:** ${complexity.charAt(0).toUpperCase() + complexity.slice(1)}
**Timeline:** ${timeline}
**Team:** ${team}

**Key Requirements:**
- Technical architecture review and spike (1-2 weeks)
- Core implementation and integration with existing systems
- Design system updates for new UI patterns
- QA, load testing, and staged rollout
- Documentation and internal training

**Dependencies:**
- ${idea.dimension_key === 'operations' ? 'Infrastructure team capacity and cloud budget approval' : 'Product and engineering alignment on priority'}
- ${idea.model_source === 'claude' ? 'Research phase to study analogous implementations in other industries' : idea.model_source === 'chatgpt' ? 'Budget approval for expanded scope and resources' : 'User research to map current emotional journey'}
- Data pipeline readiness for analytics and measurement

**Risks:**
- Scope creep if requirements aren't tightly defined upfront
- ${idea.star_level >= 8 ? 'Requires organisational buy-in beyond the product team' : 'Integration complexity with legacy systems'}`;
}

function generateRegressionVersion(idea: Idea): string {
  return `**The 80/20 Version**

Instead of building the full "${idea.title}", capture most of the value with a pragmatic first step:

**What to build:** A simplified version that focuses on the core insight — ${idea.description.split('.')[0].toLowerCase()}. Strip away the automation and start with a manual or semi-automated approach.

**Timeline:** 2-3 weeks with 1-2 engineers
**Cost:** ~20% of the full implementation

**How it works:**
1. Start with a prototype using existing tools and manual processes
2. Validate the core assumption with 10-20 pilot users
3. Measure engagement and impact before committing to the full build
4. Use learnings to refine requirements for the complete version

**What you sacrifice:**
- Full automation (manual steps remain for edge cases)
- Scale (works for early adopters, not enterprise-wide)
- Polish (functional but not yet delightful)

**What you keep:**
- The core value proposition and "aha" moment
- Real user feedback and usage data
- A foundation to iterate on quickly`;
}
