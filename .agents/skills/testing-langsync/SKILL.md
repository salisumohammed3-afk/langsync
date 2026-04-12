# Testing LangSync 10-Star Platform

## Quick Start
```bash
npm install
npx next dev -p 3000
```
Requires `.env.local` with `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`.

## E2E Test Flow
1. **Input Screen**: Use "Describe an Idea" mode. Enter a specific idea (e.g. "Journal View" — interview prep for journalists). Click "Begin Analysis".
2. **Scoring Screen**: All sliders default to 5. Continue button is always active — no need to touch sliders.
3. **Persona Screen**: Wait ~10-15s for Claude to generate 8 personas. Verify personas are specific to the input idea (not generic SaaS).
4. **Loading Screen**: SSE streaming from Claude, ChatGPT, Gemini. Progress bar tied to real API completions. Wait ~30-60s.
5. **Results Screen**: 16-24 ideas across 4 star tiers (6-9). Test filters (by model, dimension), sort, "Why X-star?" tooltips.
6. **Idea Expansion**: Click chevron to expand, then "Flesh It Out" and "Regression Version" load via ChatGPT API.
7. **Roadmap Panel**: Add ideas via "+" button, open panel via "Roadmap" button. Test phase grouping and Markdown export.

## Known Issues
- **Gemini free tier**: Frequently hits 429 rate limits. App degrades gracefully to 16 ideas from Claude + ChatGPT. Loading screen shows Gemini status correctly.
- **Markdown rendering**: Bold (`**text**`) renders correctly. Headers (`###`) may show as raw text in expansion panels.
- **localStorage**: State persists across refreshes. Clear with `localStorage.clear()` in console for fresh tests.

## Design Theme
Airbnb light theme: white backgrounds, coral red (#FF385C) accent, pill-shaped buttons, rounded cards with subtle shadows. No dark theme.

## API Routes
- `/api/personas` — Claude generates 8 stakeholder personas
- `/api/analyze-stream` — SSE streaming idea generation (Claude + ChatGPT + Gemini)
- `/api/expand` — ChatGPT idea detail expansion
- `/api/scan` — URL scanning with AI metadata extraction

## Lint & Build
```bash
npx next lint
npx next build
```
