import { motion } from "framer-motion";
import type { Asset } from "../types";

const impactEmoji: Record<string, string> = {
  red: "\uD83D\uDD34",
  yellow: "\uD83D\uDFE1",
  green: "\uD83D\uDFE2",
  gray: "\u26AA",
};

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

interface SentimentCardProps {
  asset: Asset;
  index: number;
}

export default function SentimentCard({ asset, index }: SentimentCardProps) {
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
        <span className="text-base">{impactEmoji[asset.impactColor]}</span>
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
