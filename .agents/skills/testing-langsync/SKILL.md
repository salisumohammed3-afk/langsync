# Testing LangSync 10-Star Platform

## Prerequisites

- `.env.local` must exist in the repo root with:
  - `OPENAI_API_KEY` — OpenAI API key for GPT-4o
  - `ANTHROPIC_API_KEY` — Anthropic API key for Claude
  - `GEMINI_API_KEY` — Google API key for Gemini
- Run `npm install` then `npx next dev -p 3000`

## Full E2E Test Flow

1. **Input Screen** — Click "Describe an Idea" tab, enter a company name and specific description (e.g., "Journal View" — interview prep for journalists)
2. **Scoring Screen** — Move all 5 dimension sliders (CX, Product, Sales & Growth, Operations, Brand & Trust). Button enables after all sliders are interacted with.
3. **Persona Panel** — Wait 10-15s for Claude to generate 8 personas. Verify personas are **relevant to the input idea** (e.g., journalism roles, not generic SaaS roles like "VP of Product").
4. **Loading Screen** — Click "Generate Ideas Across All Models". Wait 15-40s for real API calls. Models transition: Queued → Generating → Complete.
5. **Results Screen** — Verify 16-24 ideas across 4 star tiers (6-Delightful, 7-Remarkable, 8-Extraordinary, 9-Transformative). All ideas should reference the input idea, not generic SaaS boilerplate.
6. **Idea Expansion** — Click chevron on an idea card. Wait 5-10s for GPT-4o expansion. Two panels: "Flesh It Out" + "Regression Version" with idea-specific content.
7. **Roadmap** — Add ideas via "+" button, open roadmap panel, verify grouping by star tier.

## Key Assertions (Real AI vs Mock Data)

- **Mock data indicators**: Generic roles (VP of Product, CFO), generic ideas ("SaaS onboarding", "NPS survey"), instant loading (5.5s exactly), always 24 ideas
- **Real AI indicators**: Industry-specific roles, idea-specific content, 10-40s loading time, 16 ideas if Gemini rate-limited, 24 if all 3 models succeed

## Known Issues

- **Gemini free tier rate limits (429)**: Gemini consistently hits RESOURCE_EXHAUSTED. App degrades gracefully — returns 16 ideas from Claude + ChatGPT. A paid Gemini key resolves this.
- **Markdown H3 headers**: AI responses include `### Heading` which renders as raw text. The `renderMarkdown` helper only handles `**bold**` markers. Cosmetic only.
- **No state persistence**: Zustand store is in-memory. Page refresh loses all state.

## API Routes

- `POST /api/personas` — Claude generates 8 stakeholder personas
- `POST /api/analyze` — Claude + ChatGPT + Gemini generate ideas in parallel (Promise.allSettled for resilience)
- `POST /api/expand` — GPT-4o generates detailed implementation plan + regression version
