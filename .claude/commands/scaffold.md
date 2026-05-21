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
