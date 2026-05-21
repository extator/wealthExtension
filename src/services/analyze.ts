import type { SentimentResponse } from "../types";
import bullishData from "../mocks/bullish.json";
import bearishData from "../mocks/bearish.json";
import neutralData from "../mocks/neutral.json";

const mockResponses: SentimentResponse[] = [
  bullishData as SentimentResponse,
  bearishData as SentimentResponse,
  neutralData as SentimentResponse,
];

function getRandomDelay(): number {
  return 1500 + Math.random() * 500; // 1.5–2s
}

/**
 * Simulates AI sentiment analysis by returning mock data after a delay.
 * In Phase 2, this will call the actual AI backend.
 */
export async function analyzeImpact(
  _headline: string
): Promise<SentimentResponse> {
  const delay = getRandomDelay();
  const randomIndex = Math.floor(Math.random() * mockResponses.length);
  const response = mockResponses[randomIndex];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...response,
        headline: _headline || response.headline,
        timestamp: new Date().toISOString(),
      });
    }, delay);
  });
}
