# Product Requirements Document

*Focus: Completing Phase 1 today.*

---

## 1. Hackathon Constraints (Today's Focus)
- **Theme:** Next-Gen Innovation Build
- **Timeframe:** 6 hours of coding (Strict focus on Phase 1).
- **Deliverable:** A Minimum Viable Product (MVP) capable of demonstrating a seamless end-to-end flow using Mock Data, perfectly simulating a real API connection.

---

## 2. Functional Requirements

### Phase 1: Mockup (Must be completed today)
- **Web Scraping Simulation:** The extension must successfully read the DOM to extract news headlines or user-highlighted text in real-time. This proves the system can capture live context.
- **Mock Backend Response:** The Backend (or internal mocked function) will instantly return a pre-configured Mock JSON instead of calling the external AI.
  > **Tip:** Prepare 3 distinct mock JSON files for different scenarios (e.g., highly bullish, bearish, neutral) to cycle through during the demo.
- **Dynamic UI Display (Core Focus):**
  - **Parsing:** Extension Popup must perfectly parse the Mock JSON and render summary cards.
  - **Status Colors:** Automatically update colors (🔴 Red / 🟡 Yellow / 🟢 Green / ⚪ Gray) based on the impact level.
  - **Loading State:** Must include an artificial loading animation for 1-2 seconds to simulate realistic AI processing time.

### User Interaction Flow
1. **User navigates** to a financial news website (e.g., Bloomberg, Reuters, Yahoo Finance, CNBC).
2. **User highlights** a news headline or paragraph, then **clicks the extension icon** in the toolbar.
3. **Extension reads** the selected text (or auto-extracts the page's main headline if nothing is highlighted).
4. **Loading state** appears in the popup with a simulated processing animation (1.5–2s).
5. **Results render** as summary cards with color-coded impact indicators.

### Mock JSON Schema
```jsonc
// Example: /mocks/bullish.json
{
  "status": "success",
  "timestamp": "2026-05-21T10:30:00Z",
  "source": "Bloomberg",
  "assets": [
    {
      "ticker": "NVDA",
      "name": "NVIDIA Corporation",
      "sentiment": "bullish",        // "bullish" | "bearish" | "neutral" | "unknown"
      "impact": "high",              // "high" | "medium" | "low" | "none"
      "impactColor": "green",        // "red" | "yellow" | "green" | "gray"
      "summary": "Strong Q1 earnings beat expectations driven by AI chip demand.",
      "confidenceScore": 0.92        // 0.0 – 1.0
    }
  ],
  "overallSentiment": "bullish",
  "headline": "NVIDIA Reports Record Revenue as AI Demand Surges"
}
```
> **Note:** Prepare at least 3 mock files — `bullish.json`, `bearish.json`, `neutral.json` — to cycle through during the demo.

### Target Websites (Phase 1 — DOM Extraction)
| Website | Selector Strategy |
| :--- | :--- |
| **Yahoo Finance** | `window.getSelection()` for highlighted text, fallback to `h1[data-test-locator="headline"]` |
| **Bloomberg** | `window.getSelection()` for highlighted text, fallback to `article header h1` |

> **Tip:** Always prioritize `window.getSelection()` (user-highlighted text) over auto-extraction for accuracy.

### Phase 2: API Integration (Future Pipeline)
> **Note:** Use this section in the pitch deck to demonstrate the architectural vision.
- **Data Masking (Privacy-First):** Actively filter out Personally Identifiable Information (PII) and transmit only asset tickers (e.g., NVDA, GOOGL, NFLX).
- **Live AI Sentiment Analysis:** Transition from mock data to sending actual news prompts and portfolio variables to the LLM, retrieving live responses.

---

## 3. Non-Functional Requirements

- **Frontend Stack:** React with TypeScript for strict type management of Mock JSON responses. Tailwind CSS for rapid UI building.
- **Fail-Safe Architecture:** Structure code to support real API integration later (e.g., define `analyzeImpact()` but have it execute `return mockData;` for now).
- **Build & Deployment Standards:** All build scripts and naming conventions must use strict kebab-case (e.g., `build-step-mobius-source-file`) to prevent integration bugs during the sprint.

---

## 4. Tech Stack & Architecture

Optimized for a 6-hour sprint, prioritizing speed for Phase 1 while leaving room for Phase 2.

### Frontend (Chrome Extension UI)
| Technology | Purpose |
| :--- | :--- |
| **React** | Rapid, reusable UI components (Popup, Options, Content Scripts). |
| **TypeScript** | Strict interfaces for Mock JSON to prevent runtime errors. |
| **Tailwind CSS** | Direct component styling without context-switching. |
| **Framer Motion** | *(Optional)* Lightweight animations for fake "loading states". |

### Build Tools & Bundler
| Technology | Purpose |
| :--- | :--- |
| **Vite** | Fast bundling, instant server start, and HMR. |
| **@crxjs/vite-plugin** | Dedicated Vite plugin for Manifest V3 Chrome Extensions. |

### Extension Core APIs
- **`chrome.tabs` / `chrome.scripting`:** Query active tab and execute DOM reading scripts.
- **`chrome.storage.local`:** Temporarily store tickers or cached mock responses (no DB for Phase 1).

### Backend & Data
#### Phase 1 (Today)
- **Hardcoded JSON Mocks:** Dedicated `/mocks` folder with JSON files simulating news impacts.
- **Promise-based Delays:** Standard `setTimeout` wrapped in a Promise to simulate network latency (1.5 - 2s).

#### Phase 2 (Future Vision)
- **AI Integration:** `@google/generative-ai` SDK or OpenAI SDK for NLP.
- **Data Engine:** Java Spring Batch for nighttime jobs to aggregate market news.
- **Database:** PostgreSQL or Supabase to store portfolios and cache AI responses.
