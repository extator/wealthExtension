// Background service worker for message passing between popup and content scripts.

chrome.runtime.onMessage.addListener(
  (
    message: { type: string; data?: unknown },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => {
    if (message.type === "GET_ACTIVE_TAB") {
      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(([tab]) => {
          sendResponse({ tabId: tab?.id, url: tab?.url });
        });
      return true;
    }

    sendResponse({ error: "Unknown message type" });
    return false;
  }
);
