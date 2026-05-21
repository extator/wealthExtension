export type SentimentType = "bullish" | "bearish" | "neutral" | "unknown";

export type ImpactLevel = "high" | "medium" | "low" | "none";

export type ImpactColor = "red" | "yellow" | "green" | "gray";

export interface Asset {
  ticker: string;
  name: string;
  sentiment: SentimentType;
  impact: ImpactLevel;
  impactColor: ImpactColor;
  summary: string;
  confidenceScore: number;
}

export interface SentimentResponse {
  status: "success" | "error";
  timestamp: string;
  source: string;
  assets: Asset[];
  overallSentiment: SentimentType;
  headline: string;
}
