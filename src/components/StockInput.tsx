import { useRef, useState } from "react";

interface Suggestion {
  symbol: string;
  name: string;
}

interface StockInputProps {
  stocks: string[];
  onChange: (stocks: string[]) => void;
}

async function searchStocks(query: string): Promise<Suggestion[]> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=6&newsCount=0`,
  );
  const data = await res.json() as {
    quotes?: { symbol: string; shortname?: string; longname?: string; quoteType: string }[];
  };
  return (data.quotes ?? [])
    .filter((q) => q.quoteType === "EQUITY")
    .map((q) => ({ symbol: q.symbol, name: q.shortname ?? q.longname ?? q.symbol }));
}

export default function StockInput({ stocks, onChange }: StockInputProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase();
    setValue(v);
    setHighlighted(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!v.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchStocks(v)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);
  };

  const addStock = (ticker: string) => {
    const upper = ticker.trim().toUpperCase();
    if (!upper || stocks.includes(upper)) { setValue(""); setSuggestions([]); return; }
    onChange([...stocks, upper]);
    setValue("");
    setSuggestions([]);
    setHighlighted(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      highlighted >= 0 && suggestions[highlighted]
        ? addStock(suggestions[highlighted].symbol)
        : addStock(value);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setHighlighted(-1);
    }
  };

  const handleBlur = () => {
    // Delay so dropdown clicks register before closing
    setTimeout(() => setSuggestions([]), 150);
  };

  const remove = (ticker: string) => {
    onChange(stocks.filter((s) => s !== ticker));
  };

  const showDropdown = loading || suggestions.length > 0;

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
        STOCKS TO ANALYZE
      </label>

      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Search ticker or company..."
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => addStock(value)}
            disabled={!value.trim()}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-emerald-500 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>

        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
            {loading && (
              <div className="px-3 py-2 text-xs text-slate-500">Searching...</div>
            )}
            {suggestions.map((s, i) => (
              <button
                key={s.symbol}
                onMouseDown={() => addStock(s.symbol)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors ${
                  i === highlighted ? "bg-slate-700" : "hover:bg-slate-700"
                }`}
              >
                <span className="w-16 shrink-0 text-xs font-bold text-white">{s.symbol}</span>
                <span className="truncate text-[11px] text-slate-400">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {stocks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {stocks.map((ticker) => (
            <span
              key={ticker}
              className="flex items-center gap-1 rounded-md bg-slate-700 px-2 py-0.5 text-xs font-medium text-white"
            >
              {ticker}
              <button
                onClick={() => remove(ticker)}
                className="text-slate-400 transition-colors hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
