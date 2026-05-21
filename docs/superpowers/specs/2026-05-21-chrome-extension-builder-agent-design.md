# Chrome Extension Builder Agent — Design Spec

**Date:** 2026-05-21
**Purpose:** Claude Code agent configuration to accelerate building a financial news impact analysis Chrome Extension during a 6-hour hackathon.

---

## 1. Overview

The agent consists of two parts:

1. **`CLAUDE.md`** — Project context file that gives Claude Code full understanding of the project: tech stack, conventions, file structure, mock JSON schema, and coding standards.
2. **`.claude/commands/`** — Custom slash commands for common development workflows.

The deliverable is the Chrome Extension itself, not the agent. The agent is a productivity tool.

---

## 2. CLAUDE.md Structure

### Sections

- **Project Overview** — Chrome Extension for financial news sentiment/impact analysis (Phase 1: mock data only)
- **Tech Stack** — React 18, TypeScript, Tailwind CSS, Vite, @crxjs/vite-plugin, Chrome Manifest V3
- **Naming Convention** — kebab-case for all files, folders, and build scripts
- **Target File Structure:**
  ```
  src/
    popup/           # Extension popup UI (React app entry)
      components/    # UI components (summary cards, loading, etc.)
      app.tsx
      index.tsx
      index.css
    content/         # Content scripts for DOM extraction
      content-script.ts
    background/      # Service worker
      background.ts
    mocks/           # Mock JSON responses
      bullish.json
      bearish.json
      neutral.json
    types/           # TypeScript interfaces
      index.ts
    services/        # Business logic (analyzeImpact, etc.)
      analyze-impact.ts
    utils/           # Shared utilities
  public/
    icons/           # Extension icons
  manifest.json      # Chrome Extension manifest (managed by crxjs)
  ```
- **Mock JSON Schema** — TypeScript interfaces matching the requirement's JSON structure
- **UI Specs** — Color mapping (red/yellow/green/gray), loading animation (1.5-2s delay), summary card layout
- **Phase 1 Scope** — Explicit "do" and "don't" list
- **DOM Extraction Strategy** — `window.getSelection()` first, fallback to site-specific selectors

### Coding Standards

- All components use functional React with TypeScript
- Tailwind CSS for styling (no CSS modules)
- Strict TypeScript — no `any` types for mock data interfaces
- kebab-case file names
- Fail-safe architecture: `analyzeImpact()` returns mock data now, real API later

---

## 3. Custom Slash Commands

### `/scaffold`
**Purpose:** Generate the complete project skeleton from scratch.
**What it does:**
- Initialize Vite + React + TypeScript project
- Install dependencies (tailwindcss, @crxjs/vite-plugin, framer-motion)
- Create folder structure per spec
- Generate Chrome manifest.json (Manifest V3)
- Create TypeScript interfaces for mock JSON schema
- Create base popup app with Tailwind config
- Create content script skeleton
- Create background service worker skeleton
- Create all 3 mock JSON files (bullish, bearish, neutral)

### `/add-component`
**Purpose:** Create a new React component following project conventions.
**Arguments:** Component name and description
**What it does:**
- Creates component file in kebab-case under `src/popup/components/`
- Uses functional component with TypeScript props interface
- Includes Tailwind CSS styling

### `/add-mock`
**Purpose:** Create a new mock JSON response file.
**Arguments:** Scenario name and sentiment
**What it does:**
- Creates JSON file under `src/mocks/` following the schema
- Validates against TypeScript interface

### `/build-ext`
**Purpose:** Build and prepare the extension for Chrome loading.
**What it does:**
- Runs `npm run build`
- Reports the output directory path for loading as unpacked extension in Chrome

---

## 4. Key Design Decisions

1. **CLAUDE.md over Agent SDK** — Minimal setup time, maximum coding time for the hackathon
2. **4 commands only** — Focused on the workflows that save the most time; more commands = more maintenance
3. **Scaffold command is comprehensive** — One command to go from zero to a working project skeleton, since starting from scratch is the biggest time sink
4. **kebab-case enforced** — Per requirement, all naming uses strict kebab-case

---

## 5. Out of Scope

- Phase 2 features (AI integration, PII masking, database)
- Automated testing setup (not enough time in hackathon)
- CI/CD configuration
- Publishing to Chrome Web Store
