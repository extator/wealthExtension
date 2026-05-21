import { useEffect, useRef, useState } from "react";

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("codesmartApiKey", (data) => {
      if (data.codesmartApiKey) {
        setApiKey(data.codesmartApiKey as string);
        setHasKey(true);
      }
    });
  }, []);

  const handleSave = async () => {
    const key = apiKey.trim();
    if (!key) return;
    await chrome.storage.local.set({ codesmartApiKey: key });
    setHasKey(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = async () => {
    await chrome.storage.local.remove("codesmartApiKey");
    setApiKey("");
    setHasKey(false);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </button>

      <h2 className="mb-4 text-sm font-semibold text-white">Settings</h2>

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300">
            CodeSmart API Key
          </label>
          {hasKey && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); }}
          placeholder="sk-..."
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
        />

        <div className="mt-2 flex gap-2">
          <button
            onClick={() => void handleSave()}
            disabled={!apiKey.trim()}
            className="flex-1 rounded-md bg-emerald-500 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saved ? "Saved!" : "Save"}
          </button>
          {hasKey && (
            <button
              onClick={() => void handleClear()}
              className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-red-500 hover:text-red-400"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
        Without a key, the extension uses mock data. The key is stored locally in your browser only.
      </p>
    </div>
  );
}
