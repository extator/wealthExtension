import { getSelectorsForSite } from "./selectors";

/**
 * Extracts text from the page.
 * Priority: user-highlighted text > site-specific headline selectors > first h1
 */
export function extractTextFromPage(): string {
  // 1. Try user-highlighted text first
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();
  if (selectedText && selectedText.length > 5) {
    return selectedText;
  }

  // 2. Try site-specific selectors
  const selectors = getSelectorsForSite(window.location.hostname);
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const text = element?.textContent?.trim();
    if (text && text.length > 5) {
      return text;
    }
  }

  // 3. Fallback: page title
  return document.title;
}
