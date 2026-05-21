# Chrome Extension Builder Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Claude Code agent (CLAUDE.md + custom slash commands) that accelerates building a financial news impact analysis Chrome Extension during a 6-hour hackathon.

**Architecture:** A `CLAUDE.md` file at the project root provides full project context (tech stack, file structure, coding standards, mock JSON schema). Four custom slash commands in `.claude/commands/` handle common workflows: scaffolding, adding components, adding mocks, and building the extension.

**Tech Stack:** Claude Code custom commands (Markdown prompt files), referencing React 18, TypeScript, Tailwind CSS, Vite, @crxjs/vite-plugin, Chrome Manifest V3.

---

### Task 1: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create the CLAUDE.md file**

Create `CLAUDE.md` at the project root with the following content:

```markdown
# Financial News Impact Analyzer — Chrome Extension

## Project Overview

Chrome Extension (Manifest V3) that analyzes financial news headlines and shows their potential impact on assets. **Phase 1 uses mock data only** — no real AI calls.

### What This Extension Does (Phase 1)
1. User navigates to a financial news site (Yahoo Finance, Bloomberg)
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

## Chrome Extension APIs Used

- `chrome.tabs` — query active tab
- `chrome.scripting` — execute content script on active tab
- `chrome.storage.local` — cache mock responses
- `chrome.runtime.onMessage` / `chrome.runtime.sendMessage` — communication between content script, background, and popup

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
```

- [ ] **Step 2: Verify the file exists and is well-formed**

Run: `head -5 CLAUDE.md`
Expected: Shows the title "# Financial News Impact Analyzer — Chrome Extension"

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: add CLAUDE.md with full project context for Claude Code agent"
```

---

### Task 2: Create `/scaffold` Command

**Files:**
- Create: `.claude/commands/scaffold.md`

- [ ] **Step 1: Create the scaffold command file**

Create `.claude/commands/scaffold.md` with the following content:

````markdown
# Scaffold Chrome Extension Project

Generate the complete Chrome Extension project from scratch based on the CLAUDE.md specification.

## Instructions

Follow these steps IN ORDER. Complete each step fully before moving to the next.

### Step 1: Initialize Vite + React + TypeScript project

Run this command to create the project:

```bash
npm create vite@latest . -- --template react-ts
```

If prompted about the existing directory, confirm to continue.

Then install dependencies:

```bash
npm install
npm install -D tailwindcss @tailwindcss/vite @crxjs/vite-plugin@beta
npm install framer-motion
```

### Step 2: Configure Tailwind CSS

Replace the contents of `src/index.css` (or create `src/popup/index.css`) with:

```css
@import "tailwindcss";
```

Update `vite.config.ts` to include Tailwind:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
});
```

### Step 3: Create manifest.json

Create `manifest.json` at the project root:

```json
{
  "manifest_version": 3,
  "name": "Financial News Impact Analyzer",
  "version": "1.0.0",
  "description": "Analyze the impact of financial news on assets",
  "permissions": ["activeTab", "scripting", "storage"],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "public/icons/icon-16.png",
      "48": "public/icons/icon-48.png",
      "128": "public/icons/icon-128.png"
    }
  },
  "background": {
    "service_worker": "src/background/background.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "https://*.yahoo.com/*",
        "https://*.bloomberg.com/*",
        "https://*.reuters.com/*",
        "https://*.cnbc.com/*"
      ],
      "js": ["src/content/content-script.ts"]
    }
  ],
  "icons": {
    "16": "public/icons/icon-16.png",
    "48": "public/icons/icon-48.png",
    "128": "public/icons/icon-128.png"
  }
}
```

### Step 4: Create folder structure

Create all directories:

```bash
mkdir -p src/popup/components src/content src/background src/mocks src/types src/services src/utils public/icons
```

### Step 5: Create TypeScript types

Create `src/types/index.ts` with all the TypeScript interfaces from CLAUDE.md (Sentiment, Impact, ImpactColor, Asset, AnalysisResponse types).

### Step 6: Create mock JSON files

Create 3 files in `src/mocks/`:

**`src/mocks/bullish.json`** — 2-3 assets with bullish sentiment, high impact, green color, confidence > 0.8

**`src/mocks/bearish.json`** — 2-3 assets with bearish sentiment, high impact, red color, confidence > 0.7

**`src/mocks/neutral.json`** — 2-3 assets with mixed sentiments, medium/low impact, yellow/gray colors

Each file must conform to the `AnalysisResponse` interface.

### Step 7: Create the analyze-impact service

Create `src/services/analyze-impact.ts`:
- Export an async function `analyzeImpact(text: string): Promise<AnalysisResponse>`
- Import the 3 mock JSON files
- Pick a random mock OR cycle through them
- Wrap the return in a `setTimeout` Promise for 1.5–2 second delay
- This function will later be swapped for a real API call

### Step 8: Create the content script

Create `src/content/content-script.ts`:
- Listen for messages from the popup/background
- On message `{ type: "EXTRACT_TEXT" }`:
  - First try `window.getSelection()?.toString()`
  - If empty, try Yahoo Finance selector: `document.querySelector('h1[data-test-locator="headline"]')?.textContent`
  - If empty, try Bloomberg selector: `document.querySelector('article header h1')?.textContent`
  - If still empty, fall back to `document.title`
- Send the extracted text back via `chrome.runtime.sendMessage`

### Step 9: Create the background service worker

Create `src/background/background.ts`:
- Relay messages between content script and popup
- Listen for messages and forward them appropriately

### Step 10: Create popup UI

Create the popup entry point and components:

**`src/popup/index.html`** — Basic HTML with a div#root and script tag pointing to index.tsx

**`src/popup/index.tsx`** — React entry point, renders `<App />` into #root

**`src/popup/index.css`** — Tailwind CSS import

**`src/popup/app.tsx`** — Main app component that:
- Has states: `idle`, `loading`, `results`, `error`
- On mount, sends message to content script to extract text
- Calls `analyzeImpact()` with extracted text
- Shows LoadingSpinner during loading state
- Shows SummaryCard list during results state

**`src/popup/components/loading-spinner.tsx`** — Framer Motion animated spinner

**`src/popup/components/summary-card.tsx`** — Card showing: ticker, name, sentiment, impact color badge, summary, confidence %

**`src/popup/components/status-badge.tsx`** — Small colored badge component (red/yellow/green/gray) based on impactColor

### Step 11: Create placeholder icons

Create simple SVG or PNG placeholder icons at:
- `public/icons/icon-16.png`
- `public/icons/icon-48.png`
- `public/icons/icon-128.png`

You can generate simple colored squares or circles as placeholders.

### Step 12: Verify build

Run `npm run build` and confirm it completes without errors.

### Step 13: Commit everything

```bash
git add -A
git commit -m "feat: scaffold complete Chrome Extension project"
```
````

- [ ] **Step 2: Verify the file exists**

Run: `cat .claude/commands/scaffold.md | head -3`
Expected: Shows "# Scaffold Chrome Extension Project"

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/scaffold.md
git commit -m "feat: add /scaffold command for Chrome Extension project setup"
```

---

### Task 3: Create `/add-component` Command

**Files:**
- Create: `.claude/commands/add-component.md`

- [ ] **Step 1: Create the add-component command file**

Create `.claude/commands/add-component.md` with the following content:

````markdown
# Add React Component

Create a new React component following project conventions.

## Arguments

$ARGUMENTS should contain: component name and a brief description of what it does.

Example usage: `/add-component sentiment-chart — displays a bar chart of sentiment scores`

## Instructions

1. Parse the component name from `$ARGUMENTS`. The name should be in kebab-case (e.g., `sentiment-chart`).

2. Create the component file at `src/popup/components/<name>.tsx`:

```typescript
interface <PascalName>Props {
  // Add props based on the description
}

export function <PascalName>({ ...props }: <PascalName>Props) {
  return (
    <div className="...">
      {/* Implementation based on description */}
    </div>
  );
}
```

3. Follow these conventions:
   - File name: kebab-case (e.g., `sentiment-chart.tsx`)
   - Component name: PascalCase (e.g., `SentimentChart`)
   - Use functional component with explicit props interface
   - Use Tailwind CSS for all styling
   - Import types from `src/types/index.ts` if the component uses Asset or AnalysisResponse data
   - No default exports — use named exports

4. After creating, commit:

```bash
git add src/popup/components/<name>.tsx
git commit -m "feat: add <PascalName> component"
```
````

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/add-component.md
git commit -m "feat: add /add-component command for creating React components"
```

---

### Task 4: Create `/add-mock` Command

**Files:**
- Create: `.claude/commands/add-mock.md`

- [ ] **Step 1: Create the add-mock command file**

Create `.claude/commands/add-mock.md` with the following content:

````markdown
# Add Mock JSON Response

Create a new mock JSON response file following the project schema.

## Arguments

$ARGUMENTS should contain: scenario name and overall sentiment.

Example usage: `/add-mock tech-crash bearish`

## Instructions

1. Parse the scenario name and sentiment from `$ARGUMENTS`.

2. Create the JSON file at `src/mocks/<scenario-name>.json` conforming to the `AnalysisResponse` interface from `src/types/index.ts`:

```json
{
  "status": "success",
  "timestamp": "<current ISO timestamp>",
  "source": "<appropriate source like Bloomberg, Reuters, Yahoo Finance>",
  "assets": [
    {
      "ticker": "<relevant ticker>",
      "name": "<company name>",
      "sentiment": "<bullish|bearish|neutral|unknown>",
      "impact": "<high|medium|low|none>",
      "impactColor": "<red|yellow|green|gray>",
      "summary": "<1-2 sentence explanation>",
      "confidenceScore": 0.85
    }
  ],
  "overallSentiment": "<sentiment from arguments>",
  "headline": "<realistic news headline matching the scenario>"
}
```

3. Rules:
   - Include 2-3 assets per mock
   - `impactColor` must match sentiment: bullish+high → green, bearish+high → red, medium → yellow, low/none → gray
   - `confidenceScore` between 0.0 and 1.0
   - Use realistic tickers and company names
   - Headline should sound like a real financial news headline

4. Update `src/services/analyze-impact.ts` to import and include the new mock in its rotation.

5. Commit:

```bash
git add src/mocks/<scenario-name>.json src/services/analyze-impact.ts
git commit -m "feat: add <scenario-name> mock data"
```
````

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/add-mock.md
git commit -m "feat: add /add-mock command for creating mock JSON responses"
```

---

### Task 5: Create `/build-ext` Command

**Files:**
- Create: `.claude/commands/build-ext.md`

- [ ] **Step 1: Create the build-ext command file**

Create `.claude/commands/build-ext.md` with the following content:

````markdown
# Build Chrome Extension

Build the extension and prepare it for loading in Chrome.

## Instructions

1. Run the build:

```bash
npm run build
```

2. If the build fails, read the error output and fix the issues. Common problems:
   - TypeScript errors: check type imports and interface conformance
   - Missing dependencies: run `npm install`
   - Vite config issues: verify `vite.config.ts` has correct plugin setup

3. After successful build, report:

```
✅ Build successful!

To load the extension in Chrome:
1. Open chrome://extensions/
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project

Extension output directory: ./dist/
```

4. If there were any build warnings, list them with suggestions for fixes.
````

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/build-ext.md
git commit -m "feat: add /build-ext command for building Chrome Extension"
```

---

### Task 6: Final Verification & Commit

**Files:**
- Verify: `CLAUDE.md`
- Verify: `.claude/commands/scaffold.md`
- Verify: `.claude/commands/add-component.md`
- Verify: `.claude/commands/add-mock.md`
- Verify: `.claude/commands/build-ext.md`

- [ ] **Step 1: Verify all files exist**

Run: `ls -la CLAUDE.md .claude/commands/`
Expected: All 5 files listed (CLAUDE.md + 4 command files)

- [ ] **Step 2: Verify CLAUDE.md content**

Run: `wc -l CLAUDE.md`
Expected: ~150+ lines (comprehensive project context)

- [ ] **Step 3: Verify commands are valid**

Run: `for f in .claude/commands/*.md; do echo "=== $f ==="; head -1 "$f"; done`
Expected: Each file shows its title header

- [ ] **Step 4: Final commit if any uncommitted changes remain**

```bash
git status
# If anything unstaged:
git add CLAUDE.md .claude/commands/
git commit -m "feat: complete Chrome Extension builder agent setup"
```
