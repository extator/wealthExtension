/**
 * Send a message to the content script of the active tab.
 */
export async function sendToContentScript<T>(message: {
  type: string;
}): Promise<T> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error("No active tab found");
  }

  // Ensure content script is injected
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/index.ts"],
    });
  } catch {
    // Content script may already be injected — ignore errors
  }

  return chrome.tabs.sendMessage(tab.id, message);
}

/**
 * Extract text from the active tab's content script.
 */
export async function extractTextFromActiveTab(): Promise<string> {
  const response = await sendToContentScript<{ text: string }>({
    type: "EXTRACT_TEXT",
  });
  return response.text;
}
