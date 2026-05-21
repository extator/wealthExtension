import { extractTextFromPage } from "../utils/extract";

// Listen for messages from the popup/background
chrome.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: { text: string }) => void
  ) => {
    if (message.type === "EXTRACT_TEXT") {
      const text = extractTextFromPage();
      sendResponse({ text });
    }
    return true; // Keep message channel open for async response
  }
);
