import { useEffect, useState } from "react";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import SentimentCard from "../components/SentimentCard";
import Settings from "../components/Settings";
import StockInput from "../components/StockInput";
import PortfolioManager from "../components/PortfolioManager";
import type { Portfolio } from "../components/PortfolioManager";
import type { SentimentResponse } from "../types";
import { analyzeImpact } from "../services/analyze";
import { extractTextFromActiveTab } from "../utils/messaging";

type AppState = "idle" | "loading" | "results" | "error" | "settings";

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [data, setData] = useState<SentimentResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [stocks, setStocks] = useState<string[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  useEffect(() => {
    chrome.storage.local.get(["stockList", "portfolios"], (data) => {
      if (Array.isArray(data.stockList)) setStocks(data.stockList as string[]);
      if (Array.isArray(data.portfolios)) setPortfolios(data.portfolios as Portfolio[]);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ stockList: stocks });
  }, [stocks]);

  const savePortfolio = (name: string) => {
    const updated = [
      ...portfolios.filter((p) => p.name !== name),
      { name, stocks },
    ];
    setPortfolios(updated);
    chrome.storage.local.set({ portfolios: updated });
  };

  const deletePortfolio = (name: string) => {
    const updated = portfolios.filter((p) => p.name !== name);
    setPortfolios(updated);
    chrome.storage.local.set({ portfolios: updated });
  };

  const reorderPortfolios = (updated: Portfolio[]) => {
    setPortfolios(updated);
    chrome.storage.local.set({ portfolios: updated });
  };

  const renamePortfolio = (oldName: string, newName: string) => {
    const updated = portfolios.map((p) =>
      p.name === oldName ? { ...p, name: newName } : p,
    );
    setPortfolios(updated);
    chrome.storage.local.set({ portfolios: updated });
  };
  const [headline, setHeadline] = useState<string>("");

  const handleAnalyze = async () => {
    if (stocks.length === 0) return;
    setState("loading");
    setError("");

    try {
      let extracted: string;
      try {
        extracted = await extractTextFromActiveTab();
      } catch {
        extracted = "Financial news headline — demo mode";
      }
      setHeadline(extracted);
      const result = await analyzeImpact(extracted, stocks.join(", "));
      setData(result);
      setState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setState("error");
    }
  };

  return (
    <div className="min-h-[500px] w-[380px] bg-slate-900">
      <Header onSettingsClick={() => setState("settings")} />

      {state === "settings" && <Settings onBack={() => setState("idle")} />}

      <div className="p-4" style={{ display: state === "settings" ? "none" : undefined }}>
        {state === "idle" && (
          <div className="flex flex-col gap-4 py-6">
            <p className="text-xs text-slate-400">
              Navigate to a financial news page, add your portfolio stocks, then click Analyze.
            </p>
            <StockInput stocks={stocks} onChange={setStocks} />
            <PortfolioManager
              portfolios={portfolios}
              canSave={stocks.length > 0}
              onSave={savePortfolio}
              onLoad={setStocks}
              onDelete={deletePortfolio}
              onReorder={reorderPortfolios}
              onRename={renamePortfolio}
            />
            <button
              onClick={() => void handleAnalyze()}
              disabled={stocks.length === 0}
              className="rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Analyze
            </button>
          </div>
        )}

        {state === "loading" && <LoadingState />}

        {state === "error" && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => setState("idle")}
              className="mt-3 text-xs text-slate-400 underline hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        {state === "results" && data && (
          <div>
            <div className="mb-3 space-y-1">
              <p className="text-[10px] font-medium text-slate-400">HEADLINE</p>
              <p className="line-clamp-2 text-xs text-slate-300">{headline}</p>
              <div className="flex items-center gap-3 pt-0.5">
                <span className="text-[10px] text-slate-500">Stocks: {stocks.join(", ")}</span>
                <span className="text-[10px] text-slate-500">Overall: {data.overallSentiment}</span>
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
                setStocks([]);
                setHeadline("");
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
