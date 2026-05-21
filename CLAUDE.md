# Financial News Impact Analyzer — Chrome Extension

## Reference Documents

Before implementing, read the full specs in `docs/` for detailed context:
- `docs/superpowers/specs/requirement.md` — Product Requirements Document (PRD)
- `docs/superpowers/specs/2026-05-21-chrome-extension-builder-agent-design.md` — Design spec
- `docs/superpowers/plans/2026-05-21-chrome-extension-builder-agent.md` — Implementation plan

## Project Overview

Chrome Extension (Manifest V3) that analyzes financial news headlines and shows their potential impact on assets. **Phase 1 uses mock data only** — no real AI calls.

### Hackathon Context
- **Theme:** Next-Gen Innovation Build
- **Timeframe:** 6 hours of coding (strict focus on Phase 1)
- **Deliverable:** MVP demonstrating seamless end-to-end flow using mock data, simulating a real API connection

### What This Extension Does (Phase 1)
1. User navigates to a financial news site (Yahoo Finance, Bloomberg, Reuters, CNBC)
2. User highlights a headline or paragraph, clicks the extension icon
3. Extension reads selected text (or auto-extracts main headline)
4. Loading animation plays for 1.5–2 seconds
5. Results render as color-coded summary cards

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Popup UI components |
| TypeScript | Strict typing for all code |
| Tailwind CSS | Utility-first styling |
| Vite | Bundler with HMR |
| @crxjs/vite-plugin | Manifest V3 Chrome Extension support for Vite |
| Framer Motion | Loading animations |

## Naming Conventions

**STRICT: All file names, folder names, and build scripts use kebab-case.**

- Files: `summary-card.tsx`, `analyze-impact.ts`, `content-script.ts`
- Folders: `src/popup/components/`, `src/mocks/`
- Components: PascalCase in code (`SummaryCard`), kebab-case file name (`summary-card.tsx`)

## File Structure

```
src/
  popup/                    # Extension popup UI
    components/             # React components
      summary-card.tsx      # Individual asset impact card
      loading-spinner.tsx   # Fake loading animation
      status-badge.tsx      # Color-coded impact badge
    app.tsx                 # Main popup app component
    index.tsx               # React entry point
    index.css               # Tailwind imports
  content/                  # Content scripts
    content-script.ts       # DOM text extraction
  background/               # Service worker
    background.ts           # Message handling between content/popup
  mocks/                    # Mock JSON responses
    bullish.json
    bearish.json
    neutral.json
  types/                    # TypeScript interfaces
    index.ts                # All shared types
  services/                 # Business logic
    analyze-impact.ts       # analyzeImpact() — returns mock data for now
  utils/                    # Shared utilities
public/
  icons/                    # Extension icons (16, 48, 128px)
vite.config.ts
tailwind.config.ts
manifest.json              # Managed by @crxjs/vite-plugin
```

## TypeScript Interfaces

All mock data MUST conform to these types:

```typescript
export type Sentiment = "bullish" | "bearish" | "neutral" | "unknown";
export type Impact = "high" | "medium" | "low" | "none";
export type ImpactColor = "red" | "yellow" | "green" | "gray";

export interface Asset {
  ticker: string;
  name: string;
  sentiment: Sentiment;
  impact: Impact;
  impactColor: ImpactColor;
  summary: string;
  confidenceScore: number; // 0.0 – 1.0
}

export interface AnalysisResponse {
  status: "success" | "error";
  timestamp: string;
  source: string;
  assets: Asset[];
  overallSentiment: Sentiment;
  headline: string;
}
```

## Mock JSON Schema

Each mock file in `src/mocks/` must match the `AnalysisResponse` interface above. Prepare 3 files:
- `bullish.json` — positive sentiment, green indicators
- `bearish.json` — negative sentiment, red indicators
- `neutral.json` — mixed/neutral, yellow/gray indicators

## UI Specs

### Impact Color Mapping
| Impact | Color | Tailwind Class | Emoji |
|---|---|---|---|
| high + bullish | Green | `bg-green-500` | 🟢 |
| high + bearish | Red | `bg-red-500` | 🔴 |
| medium | Yellow | `bg-yellow-500` | 🟡 |
| low / none | Gray | `bg-gray-400` | ⚪ |

### Loading State
- Show loading animation for 1.5–2 seconds (simulated delay)
- Use `setTimeout` wrapped in a Promise
- Framer Motion for smooth transitions

### Summary Card Layout
Each card shows: ticker, company name, sentiment badge, impact indicator, summary text, confidence score as percentage.

## DOM Extraction Strategy

**Priority order:**
1. `window.getSelection()?.toString()` — user-highlighted text (always preferred)
2. Site-specific fallbacks:
   - Yahoo Finance: `h1[data-test-locator="headline"]`
   - Bloomberg: `article header h1`
3. Final fallback: `document.title`

### Target Websites (Phase 1)
| Website | URL Pattern |
|---|---|
| Yahoo Finance | `https://*.yahoo.com/*` |
| Bloomberg | `https://*.bloomberg.com/*` |
| Reuters | `https://*.reuters.com/*` |
| CNBC | `https://*.cnbc.com/*` |

## Chrome Extension APIs Used

- `chrome.tabs` — query active tab
- `chrome.scripting` — execute content script on active tab
- `chrome.storage.local` — cache mock responses
- `chrome.runtime.onMessage` / `chrome.runtime.sendMessage` — communication between content script, background, and popup

### Message Passing Architecture

```
Popup (React App)
  ↕ chrome.runtime.sendMessage / onMessage
Background (Service Worker)
  ↕ chrome.tabs.sendMessage / onMessage
Content Script (DOM access)
```

1. Popup sends `{ type: "EXTRACT_TEXT" }` to background
2. Background forwards to content script on active tab
3. Content script extracts text from DOM and responds
4. Background relays extracted text back to popup
5. Popup calls `analyzeImpact(text)` and renders results

## Phase 1 Scope

### DO:
- Read DOM text via content script
- Return hardcoded mock JSON from `analyzeImpact()`
- Render summary cards with color-coded impact
- Show loading animation (1.5–2s fake delay)
- Support `window.getSelection()` + site-specific fallbacks

### DO NOT:
- Call any external AI API
- Implement PII masking
- Set up a database
- Add automated tests
- Publish to Chrome Web Store

## Coding Standards

- Functional React components only (no class components)
- All props must have TypeScript interfaces
- No `any` types for mock data — use the interfaces above
- Tailwind CSS only — no CSS modules, no styled-components
- `analyzeImpact()` must be structured as an async function returning `Promise<AnalysisResponse>` so it can later be swapped for a real API call

## Custom Slash Commands

| Command | Purpose |
|---|---|
| `/scaffold` | Generate complete project skeleton from scratch (Vite + React + TS, deps, folder structure, manifest, types, mocks, all components) |
| `/add-component` | Create a new React component following kebab-case file / PascalCase export conventions |
| `/add-mock` | Create a new mock JSON response conforming to `AnalysisResponse` and register it in `analyzeImpact()` |
| `/build-ext` | Run `npm run build` and report the `dist/` path for loading as unpacked extension in Chrome |

## Phase 2 Vision (Future — Not in Scope)

For architectural awareness only — do NOT implement these in Phase 1:
- **PII Masking:** Filter out personally identifiable information, transmit only asset tickers
- **Live AI Sentiment Analysis:** Replace mock data with real LLM calls (`@google/generative-ai` or OpenAI SDK)
- **Data Engine:** Java Spring Batch for nighttime news aggregation jobs
- **Database:** PostgreSQL or Supabase for portfolio storage and AI response caching
