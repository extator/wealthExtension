import { extractTextFromPage } from "../utils/extract";
import type { SentimentResponse, Asset } from "../types";

chrome.runtime.onMessage.addListener((
  message: { type: string; result?: SentimentResponse; portfolioName?: string; headline?: string; error?: string },
  _sender,
  sendResponse,
) => {
  if (message.type === "EXTRACT_TEXT") {
    sendResponse({ text: extractTextFromPage() });
  }
  if (message.type === "QUICK_LOADING") showLoading();
  if (message.type === "QUICK_RESULT") showResult(message.result!, message.portfolioName ?? "", message.headline ?? "");
  if (message.type === "QUICK_ERROR") showError(message.error ?? "Unknown error");
  return true;
});

// ── Overlay helpers ──────────────────────────────────────────────────────────

function getOrCreateBox(): HTMLElement {
  let box = document.getElementById("__sa_box");
  if (!box || !box.isConnected) {
    document.getElementById("__sa_box")?.remove();
    box = document.createElement("div");
    box.id = "__sa_box";
    box.innerHTML = `
      <div class="sa-header">
        <span class="sa-title">📊 Sentiment Analyzer</span>
        <button class="sa-close" title="Close">✕</button>
      </div>
      <div class="sa-body"></div>
    `;
    box.querySelector(".sa-close")!.addEventListener("click", () => {
      box!.remove();
    });
    makeDraggable(box, box.querySelector(".sa-header") as HTMLElement);
    document.body.appendChild(box);
  }
  return box;
}

function showLoading() {
  const box = getOrCreateBox();
  box.querySelector(".sa-body")!.innerHTML =
    '<div class="sa-loading">Analyzing...</div>';
}

function showError(error: string) {
  const box = getOrCreateBox();
  box.querySelector(".sa-body")!.innerHTML =
    `<div class="sa-error">❌ ${escHtml(error)}</div>`;
}

// Sentiment color values mirroring tailwind.config.ts
const SENTIMENT_COLOR: Record<string, string> = {
  bullish: "#22c55e",
  bearish: "#ef4444",
  neutral: "#eab308",
  unknown: "#9ca3af",
};

const SENTIMENT_BADGE: Record<string, { bg: string; text: string }> = {
  bullish: { bg: "rgba(34,197,94,0.1)",  text: "#4ade80" },
  bearish: { bg: "rgba(239,68,68,0.1)",  text: "#f87171" },
  neutral: { bg: "rgba(234,179,8,0.1)",  text: "#facc15" },
  unknown: { bg: "rgba(107,114,128,0.1)", text: "#9ca3af" },
};

function renderCard(asset: Asset): string {
  const border = SENTIMENT_COLOR[asset.sentiment] ?? "#9ca3af";
  const badge = SENTIMENT_BADGE[asset.sentiment] ?? SENTIMENT_BADGE.unknown;
  const label = asset.sentiment.charAt(0).toUpperCase() + asset.sentiment.slice(1);

  return `
    <div class="sa-card" style="border-left-color:${border}">
      <div class="sa-card-top">
        <div class="sa-card-left">
          <span class="sa-ticker">${escHtml(asset.ticker)}</span>
          <span class="sa-name">${escHtml(asset.name)}</span>
        </div>
        <div class="sa-price-wrap" id="sa-price-${escHtml(asset.ticker)}">
          <div class="sa-price-skel"></div>
          <div class="sa-price-skel sa-price-skel-sm"></div>
        </div>
      </div>
      <div class="sa-card-meta">
        <span class="sa-badge" style="background:${badge.bg};color:${badge.text}">${label}</span>
        <span class="sa-meta-text">Impact: ${escHtml(asset.impact)}</span>
        <span class="sa-meta-text">Confidence: ${Math.round(asset.confidenceScore * 100)}%</span>
      </div>
      <div class="sa-summary">${escHtml(asset.summary)}</div>
    </div>
  `;
}

function showResult(result: SentimentResponse, portfolioName: string, headline: string) {
  const box = getOrCreateBox();
  const overallColor = SENTIMENT_COLOR[result.overallSentiment] ?? "#9ca3af";

  box.querySelector(".sa-body")!.innerHTML = `
    <div class="sa-result-meta">
      <span class="sa-portfolio-badge">${escHtml(portfolioName)}</span>
      <span class="sa-overall" style="color:${overallColor}">${escHtml(result.overallSentiment)}</span>
    </div>
    <div class="sa-headline">${escHtml(headline)}</div>
    <div class="sa-cards">${result.assets.map(renderCard).join("")}</div>
  `;

  // Fetch prices per card after render
  result.assets.forEach((asset) => {
    fetchPrice(asset.ticker).then((p) => {
      const el = document.getElementById(`sa-price-${asset.ticker}`);
      if (!el) return;
      if (!p) { el.innerHTML = '<span class="sa-price-empty">—</span>'; return; }
      const pos = p.change >= 0;
      el.innerHTML = `
        <span class="sa-price">${"$"}${p.price.toFixed(2)}</span>
        <span class="sa-change" style="color:${pos ? "#4ade80" : "#f87171"}">
          ${pos ? "+" : ""}${p.change.toFixed(2)} (${pos ? "+" : ""}${p.changePercent.toFixed(2)}%)
        </span>
      `;
    }).catch(() => {
      const el = document.getElementById(`sa-price-${asset.ticker}`);
      if (el) el.innerHTML = '<span class="sa-price-empty">—</span>';
    });
  });
}

async function fetchPrice(ticker: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  );
  const data = await res.json() as {
    chart?: { result?: { meta?: { regularMarketPrice?: number; previousClose?: number; chartPreviousClose?: number } }[] };
  };
  const meta = data.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) return null;
  const prev = meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPrice;
  const change = meta.regularMarketPrice - prev;
  return { price: meta.regularMarketPrice, change, changePercent: (change / prev) * 100 };
}

function makeDraggable(el: HTMLElement, handle: HTMLElement) {
  let startX = 0, startY = 0, initLeft = 0, initTop = 0;
  handle.style.cursor = "move";
  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const rect = el.getBoundingClientRect();
    initLeft = rect.left; initTop = rect.top;
    startX = e.clientX; startY = e.clientY;
    const onMove = (e: MouseEvent) => {
      el.style.left = initLeft + e.clientX - startX + "px";
      el.style.top = initTop + e.clientY - startY + "px";
      el.style.right = "auto"; el.style.bottom = "auto";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

function escHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
