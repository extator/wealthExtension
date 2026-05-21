import { analyzeImpact } from "../services/analyze";
import type { Portfolio } from "../components/PortfolioManager";

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== "quick-analyze") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { type: "QUICK_LOADING" }).catch(() => {});

  try {
    const data = await chrome.storage.local.get("portfolios");
    const portfolios = (data.portfolios as Portfolio[]) ?? [];

    if (portfolios.length === 0) {
      chrome.tabs.sendMessage(tab.id, {
        type: "QUICK_ERROR",
        error: "No saved portfolios — open the extension popup to add one.",
      }).catch(() => {});
      return;
    }

    const first = portfolios[0];

    let headline = "";
    try {
      const res = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_TEXT" }) as { text: string };
      headline = res.text;
    } catch {
      headline = tab.title ?? "Financial news";
    }

    const result = await analyzeImpact(headline, first.stocks.join(", "));
    chrome.tabs.sendMessage(tab.id, {
      type: "QUICK_RESULT",
      result,
      portfolioName: first.name,
      headline,
    }).catch(() => {});
  } catch (err) {
    chrome.tabs.sendMessage(tab.id, {
      type: "QUICK_ERROR",
      error: err instanceof Error ? err.message : "Analysis failed",
    }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((
  message: { type: string },
  _sender,
  sendResponse,
) => {
  if (message.type === "GET_ACTIVE_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      sendResponse({ tabId: tab?.id, url: tab?.url });
    });
    return true;
  }
  sendResponse({ error: "Unknown message type" });
  return false;
});
