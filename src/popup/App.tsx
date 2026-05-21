import { useState } from "react";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import SentimentCard from "../components/SentimentCard";
import type { SentimentResponse } from "../types";
import { analyzeImpact } from "../services/analyze";
import { extractTextFromActiveTab } from "../utils/messaging";

type AppState = "idle" | "loading" | "results" | "error";

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [data, setData] = useState<SentimentResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");

  const handleAnalyze = async () => {
    setState("loading");
    setError("");

    try {
      let headline: string;

      try {
        headline = await extractTextFromActiveTab();
      } catch {
        // Fallback if content script communication fails (e.g., dev mode)
        headline = "Financial news headline — demo mode";
      }

      setExtractedText(headline);
      const result = await analyzeImpact(headline);
      setData(result);
      setState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setState("error");
    }
  };

  return (
    <div className="min-h-[500px] w-[380px] bg-slate-900">
      <Header />

      <div className="p-4">
        {state === "idle" && (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-slate-400">
              Highlight text on a financial news site, then click analyze.
            </p>
            <button
              onClick={handleAnalyze}
              className="mt-4 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 active:bg-emerald-700"
            >
              Analyze Sentiment
            </button>
          </div>
        )}

        {state === "loading" && <LoadingState />}

        {state === "error" && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={handleAnalyze}
              className="mt-3 text-xs text-slate-400 underline hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        {state === "results" && data && (
          <div>
            <div className="mb-3">
              <p className="text-xs text-slate-500">Extracted Text</p>
              <p className="line-clamp-2 text-sm font-medium text-white">
                {extractedText}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-500">
                  Source: {data.source}
                </span>
                <span className="text-[10px] text-slate-500">
                  Overall: {data.overallSentiment}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {data.assets.map((asset, i) => (
                <SentimentCard key={asset.ticker} asset={asset} index={i} />
              ))}
            </div>

            <button
              onClick={() => {
                setState("idle");
                setData(null);
                setExtractedText("");
              }}
              className="mt-4 w-full rounded-lg border border-slate-700 py-2 text-xs text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
            >
              Analyze Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
