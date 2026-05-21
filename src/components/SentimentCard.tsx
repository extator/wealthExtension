import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Asset } from "../types";

const sentimentLabel: Record<string, string> = {
  bullish: "Bullish",
  bearish: "Bearish",
  neutral: "Neutral",
  unknown: "Unknown",
};

const sentimentBorder: Record<string, string> = {
  bullish: "border-l-sentiment-bullish",
  bearish: "border-l-sentiment-bearish",
  neutral: "border-l-sentiment-neutral",
  unknown: "border-l-sentiment-unknown",
};

const sentimentBadgeBg: Record<string, string> = {
  bullish: "bg-emerald-500/10 text-emerald-400",
  bearish: "bg-red-500/10 text-red-400",
  neutral: "bg-yellow-500/10 text-yellow-400",
  unknown: "bg-gray-500/10 text-gray-400",
};

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
}

async function fetchPrice(ticker: string): Promise<PriceData> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  );
  const data = await res.json() as {
    chart?: {
      result?: {
        meta?: {
          regularMarketPrice?: number;
          previousClose?: number;
          chartPreviousClose?: number;
        };
      }[];
    };
  };
  const meta = data.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error("No price");
  const prev = meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPrice;
  const change = meta.regularMarketPrice - prev;
  return {
    price: meta.regularMarketPrice,
    change,
    changePercent: (change / prev) * 100,
  };
}

interface SentimentCardProps {
  asset: Asset;
  index: number;
}

export default function SentimentCard({ asset, index }: SentimentCardProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    setPriceLoading(true);
    fetchPrice(asset.ticker)
      .then(setPriceData)
      .catch(() => setPriceData(null))
      .finally(() => setPriceLoading(false));
  }, [asset.ticker]);

  const isPositive = (priceData?.change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`rounded-lg border-l-4 ${sentimentBorder[asset.sentiment]} bg-slate-800 p-3`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{asset.ticker}</span>
          <span className="text-xs text-slate-400">{asset.name}</span>
        </div>

        <div className="text-right">
          {priceLoading ? (
            <div className="flex flex-col items-end gap-1">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-700" />
              <div className="h-3 w-12 animate-pulse rounded bg-slate-700" />
            </div>
          ) : priceData ? (
            <>
              <p className="text-sm font-semibold text-white">
                ${priceData.price.toFixed(2)}
              </p>
              <p className={`text-[10px] font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {isPositive ? "+" : ""}{priceData.change.toFixed(2)} ({isPositive ? "+" : ""}{priceData.changePercent.toFixed(2)}%)
              </p>
            </>
          ) : (
            <p className="text-[10px] text-slate-600">—</p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sentimentBadgeBg[asset.sentiment]}`}
        >
          {sentimentLabel[asset.sentiment]}
        </span>
        <span className="text-[10px] text-slate-500">
          Impact: {asset.impact}
        </span>
        <span className="text-[10px] text-slate-500">
          Confidence: {Math.round(asset.confidenceScore * 100)}%
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-300">
        {asset.summary}
      </p>
    </motion.div>
  );
}
