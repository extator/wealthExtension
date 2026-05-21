import { useRef, useState } from "react";

export interface Portfolio {
  name: string;
  stocks: string[];
}

interface PortfolioManagerProps {
  portfolios: Portfolio[];
  canSave: boolean;
  onSave: (name: string) => void;
  onLoad: (stocks: string[]) => void;
  onDelete: (name: string) => void;
  onReorder: (portfolios: Portfolio[]) => void;
  onRename: (oldName: string, newName: string) => void;
}

export default function PortfolioManager({
  portfolios, canSave, onSave, onLoad, onDelete, onReorder, onRename,
}: PortfolioManagerProps) {
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [renamingName, setRenamingName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const trimmed = saveName.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setSaveName("");
    setSaving(false);
  };

  // ── Rename ────────────────────────────────────────────────────────────────
  const startRename = (name: string) => {
    setRenamingName(name);
    setRenameValue(name);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== renamingName) onRename(renamingName!, trimmed);
    setRenamingName(null);
  };

  // ── Drag-to-reorder ───────────────────────────────────────────────────────
  const handleDragStart = (i: number) => { dragIndex.current = i; };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    dragOverIndex.current = i;
  };

  const handleDrop = () => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from === null || to === null || from === to) return;
    const next = [...portfolios];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onReorder(next);
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400">MY PORTFOLIOS</span>
        {canSave && !saving && (
          <button
            onClick={() => setSaving(true)}
            className="text-[10px] text-emerald-400 transition-colors hover:text-emerald-300"
          >
            + Save current
          </button>
        )}
      </div>

      {saving && (
        <div className="mb-2 flex gap-2">
          <input
            autoFocus
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setSaving(false);
            }}
            placeholder="Portfolio name"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSave}
            disabled={!saveName.trim()}
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={() => setSaving(false)}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {portfolios.length === 0 && !saving ? (
        <p className="text-[11px] text-slate-600">No saved portfolios yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {portfolios.map((p, i) => (
            <div
              key={p.name}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={handleDrop}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-2 py-2"
            >
              {/* Drag handle */}
              <span className="cursor-grab select-none text-slate-600 active:cursor-grabbing">
                ⠿
              </span>

              {/* Name + stocks */}
              <div className="min-w-0 flex-1">
                {renamingName === p.name ? (
                  <input
                    autoFocus
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setRenamingName(null);
                    }}
                    onBlur={commitRename}
                    className="w-full rounded border border-emerald-500 bg-slate-900 px-1.5 py-0.5 text-xs text-white outline-none"
                  />
                ) : (
                  <button
                    onClick={() => startRename(p.name)}
                    className="block w-full truncate text-left text-xs font-medium text-white hover:text-emerald-400"
                    title="Click to rename"
                  >
                    {p.name}
                  </button>
                )}
                <p className="truncate text-[10px] text-slate-500">{p.stocks.join(", ")}</p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => onLoad(p.stocks)}
                  className="text-[10px] text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  Load
                </button>
                <button
                  onClick={() => onDelete(p.name)}
                  className="text-[10px] text-slate-500 transition-colors hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
