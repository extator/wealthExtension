import type { SentimentResponse } from "../types";
import bullishData from "../mocks/bullish.json";
import bearishData from "../mocks/bearish.json";
import neutralData from "../mocks/neutral.json";

const CODESMART_URL = "https://api.codesmart.app/v1/chat/completions";

const SYSTEM_PROMPT = `You are a financial news sentiment analyzer.
Given a news headline and a list of specific stocks, analyze how the headline impacts each stock. Return JSON only — no markdown, no extra text:
{
  "status": "success",
  "timestamp": "<ISO 8601>",
  "source": "<news source or 'unknown'>",
  "headline": "<echo the headline>",
  "overallSentiment": "<bullish|bearish|neutral|unknown>",
  "assets": [
    {
      "ticker": "<stock ticker>",
      "name": "<full company name>",
      "sentiment": "<bullish|bearish|neutral|unknown>",
      "impact": "<high|medium|low|none>",
      "impactColor": "<green|red|yellow|gray>",
      "summary": "<1-2 sentence explanation of how the headline affects this stock>",
      "confidenceScore": <0.0-1.0>
    }
  ]
}
Rules: impactColor → bullish+high=green, bearish+high=red, medium=yellow, low/none=gray. Return one entry per input stock only.`;

const mockResponses: SentimentResponse[] = [
  bullishData as SentimentResponse,
  bearishData as SentimentResponse,
  neutralData as SentimentResponse,
];

function randomMock(headline: string): SentimentResponse {
  const i = Math.floor(Math.random() * mockResponses.length);
  return { ...mockResponses[i], headline, timestamp: new Date().toISOString() };
}

async function askCodesmart(headline: string, stocks: string): Promise<SentimentResponse> {
  const { codesmartApiKey } = await chrome.storage.local.get("codesmartApiKey");
  if (!codesmartApiKey) throw new Error("No CodeSmart API key — open the extension popup to configure");

  const res = await fetch(CODESMART_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${codesmartApiKey as string}`,
    },
    body: JSON.stringify({
      model: "codesmart",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Headline: ${headline}\nStocks to analyze: ${stocks}` },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw new Error(`CodeSmart API error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("No response from CodeSmart");
  return JSON.parse(text) as SentimentResponse;
}

export async function analyzeImpact(headline: string, stocks: string): Promise<SentimentResponse> {
  const { codesmartApiKey } = await chrome.storage.local.get("codesmartApiKey");

  if (codesmartApiKey) {
    return askCodesmart(headline, stocks);
  }

  // No key configured — use mock
  return new Promise((resolve) =>
    setTimeout(() => resolve(randomMock(headline)), 1500 + Math.random() * 500)
  );
}
