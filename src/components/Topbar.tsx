import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Download,
  Loader2,
  Menu,
  PanelRight,
  Redo2,
  Sparkles,
  Undo2,
  Upload,
} from "lucide-react";
import type { ReadmeDocument, SaveStatus } from "../types";
import { formatTime } from "../lib/format";

interface TopbarProps {
  document: ReadmeDocument | null;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  previewOpen: boolean;
  aiOpen: boolean;
  onRename: (name: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onImportFile: (file: File) => void;
  onExport: () => void;
  onTogglePreview: () => void;
  onToggleAI: () => void;
  onToggleSidebar: () => void;
}

export function Topbar({
  document,
  saveStatus,
  lastSavedAt,
  canUndo,
  canRedo,
  previewOpen,
  aiOpen,
  onRename,
  onUndo,
  onRedo,
  onImportFile,
  onExport,
  onTogglePreview,
  onToggleAI,
  onToggleSidebar,
}: TopbarProps) {
  const [draftName, setDraftName] = useState(document?.name ?? "");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cancelRename = useRef(false);

  useEffect(() => {
    setDraftName(document?.name ?? "");
  }, [document?.id, document?.name]);

  const commitName = () => {
    if (!document) return;
    if (cancelRename.current) {
      cancelRename.current = false;
      setDraftName(document.name);
      return;
    }
    const nextName = draftName.trim() || "Untitled README";
    setDraftName(nextName);
    if (nextName !== document.name) onRename(nextName);
  };

  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-white/85 px-4 py-2 backdrop-blur-xl sm:px-5 lg:flex-nowrap lg:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#515154] transition-colors hover:bg-canvas hover:text-ink lg:hidden"
        >
          <Menu size={18} />
        </button>

        {document ? (
          <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:flex-none">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
                if (event.key === "Escape") {
                  cancelRename.current = true;
                  setDraftName(document.name);
                  event.currentTarget.blur();
                }
              }}
              aria-label="Document name"
              maxLength={80}
              spellCheck={false}
              className="min-w-0 max-w-[300px] flex-1 truncate rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[14px] font-semibold tracking-[-0.01em] text-ink outline-none transition-colors hover:border-line focus:border-line focus:bg-white focus:ring-2 focus:ring-accent/15"
            />
            <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
          </div>
        ) : (
          <span className="px-1.5 text-[14px] font-semibold tracking-tight text-ink">
            README Studio
          </span>
        )}
      </div>

      <div className="ml-auto flex w-full items-center justify-end gap-1 sm:w-auto lg:ml-auto">
        <button
          type="button"
          onClick={onUndo}
          disabled={!document || !canUndo}
          aria-label="Undo"
          title="Undo (Ctrl / ⌘ + Z)"
          className="icon-button"
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!document || !canRedo}
          aria-label="Redo"
          title="Redo (Ctrl / ⌘ + Shift + Z)"
          className="icon-button"
        >
          <Redo2 size={16} />
        </button>

        <span className="mx-1.5 hidden h-4 w-px bg-line sm:block" />

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.mdown,.txt,text/markdown,text/plain"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportFile(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Import Markdown"
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[12.5px] font-medium text-[#515154] transition-colors hover:bg-canvas hover:text-ink"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={!document}
          title="Export README.md"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-[12.5px] font-medium text-ink shadow-sm transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={14} />
          <span className="hidden md:inline">Export README.md</span>
          <span className="md:hidden">Export</span>
        </button>
        <button
          type="button"
          onClick={onToggleAI}
          aria-label={aiOpen ? "Close AI assistant" : "Open AI assistant"}
          aria-pressed={aiOpen}
          title={aiOpen ? "Close AI assistant" : "Open AI assistant"}
          className={`ml-0.5 inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium transition-colors ${
            aiOpen
              ? "bg-accent/10 text-accent"
              : "text-[#515154] hover:bg-canvas hover:text-ink"
          }`}
        >
          <Sparkles size={14} />
          AI
        </button>
        <button
          type="button"
          onClick={onTogglePreview}
          disabled={!document}
          aria-label={previewOpen ? "Hide preview" : "Show preview"}
          aria-pressed={previewOpen}
          title={previewOpen ? "Hide preview" : "Show preview"}
          className={`ml-0.5 flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            previewOpen ? "bg-accent/10 text-accent" : "text-[#515154] hover:bg-canvas hover:text-ink"
          }`}
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
}

function SaveIndicator({
  status,
  lastSavedAt,
}: {
  status: SaveStatus;
  lastSavedAt: string | null;
}) {
  const time = formatTime(lastSavedAt);

  if (status === "saving") {
    return (
      <span
        className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted"
        aria-live="polite"
        title="Saving locally"
      >
        <Loader2 size={12} className="animate-spin" />
        <span className="hidden sm:inline">Saving</span>
      </span>
    );
  }

  if (status === "error") {
    return (
      <span
        className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-danger"
        title="Changes could not be saved in this browser."
        aria-live="polite"
      >
        <AlertCircle size={12} />
        <span className="hidden sm:inline">Not saved</span>
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted"
      title={time ? `Last saved at ${time}` : "Saved locally"}
      aria-live="polite"
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-success/10">
        <Check size={9} strokeWidth={2.6} className="text-success" />
      </span>
      <span className="hidden sm:inline">Saved</span>
    </span>
  );
}
