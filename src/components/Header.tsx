export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
          SA
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">
            Sentiment Analyzer
          </h1>
          <p className="text-[10px] text-slate-400">
            Financial News Impact Analysis
          </p>
        </div>
      </div>
    </header>
  );
}
