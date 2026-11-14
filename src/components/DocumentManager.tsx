import { useMemo, useRef, useState } from "react";
import {
  Copy,
  FileText,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ReadmeDocument } from "../types";
import { countWords, getExcerpt } from "../lib/markdown";
import { formatRelativeDate } from "../lib/format";
import { ConfirmDialog } from "./ConfirmDialog";
import { Logo } from "./Logo";

interface DocumentManagerProps {
  documents: ReadmeDocument[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onOpenTemplates: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentManager({
  documents,
  activeId,
  onOpen,
  onCreate,
  onOpenTemplates,
  onRename,
  onDuplicate,
  onDelete,
}: DocumentManagerProps) {
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ReadmeDocument | null>(null);
  const cancelRename = useRef(false);

  const sortedDocuments = useMemo(
    () =>
      [...documents].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return sortedDocuments;
    return sortedDocuments.filter(
      (document) =>
        document.name.toLowerCase().includes(cleanQuery) ||
        document.content.toLowerCase().includes(cleanQuery),
    );
  }, [query, sortedDocuments]);

  const beginRename = (document: ReadmeDocument) => {
    cancelRename.current = false;
    setRenamingId(document.id);
    setRenameDraft(document.name);
  };

  const commitRename = (document: ReadmeDocument) => {
    if (cancelRename.current) {
      cancelRename.current = false;
      setRenamingId(null);
      return;
    }
    const nextName = renameDraft.trim() || "Untitled README";
    if (nextName !== document.name) onRename(document.id, nextName);
    setRenamingId(null);
  };

  return (
    <div className="view-scroll">
      <div className="mx-auto w-full max-w-6xl px-6 py-9 sm:px-8 lg:py-11">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
              Workspace
            </p>
            <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">
              My Projects
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {documents.length === 0
                ? "Your README documents live here, stored privately in this browser."
                : `${documents.length} document${
                    documents.length === 1 ? "" : "s"
                  } saved locally in this browser.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenTemplates}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[13px] font-medium text-ink shadow-sm transition-colors hover:bg-canvas"
            >
              <Sparkles size={14} className="text-muted" />
              Templates
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#2C6EE4]"
            >
              <Plus size={15} />
              New README
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="mt-9 flex flex-col items-center rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-card">
            <Logo className="w-full max-w-[220px]" />
            <h2 className="mt-7 text-[17px] font-semibold tracking-tight text-ink">
              No projects yet
            </h2>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
              Create a blank README or start from a detailed template. Everything is saved
              automatically as you write.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={onCreate}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2C6EE4]"
              >
                <Plus size={15} />
                Create your first README
              </button>
              <button
                type="button"
                onClick={onOpenTemplates}
                className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-4 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
              >
                Browse templates
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-7 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-xs">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search documents"
                  aria-label="Search documents"
                  className="h-9 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] text-ink outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/15"
                />
              </div>
              <p className="hidden text-[11px] text-muted sm:block">
                Sorted by most recently edited
              </p>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-line bg-white px-6 py-12 text-center">
                <p className="text-[14px] font-medium text-ink">No matching documents</p>
                <p className="mt-1 text-[12.5px] text-muted">
                  Try a different name or search term.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map((document) => {
                  const isActive = document.id === activeId;
                  const isRenaming = document.id === renamingId;
                  return (
                    <article
                      key={document.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => !isRenaming && onOpen(document.id)}
                      onKeyDown={(event) => {
                        if (!isRenaming && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          onOpen(document.id);
                        }
                      }}
                      className={`group relative flex cursor-pointer flex-col rounded-xl border bg-white p-4 text-left transition-all hover:-translate-y-px hover:border-[#CFCFD6] hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
                        isActive ? "border-accent/30 ring-1 ring-accent/10" : "border-line"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                            isActive
                              ? "border-accent/15 bg-accent/[0.06] text-accent"
                              : "border-line bg-canvas text-muted"
                          }`}
                        >
                          <FileText size={16} strokeWidth={1.7} />
                        </span>
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                          <button
                            type="button"
                            aria-label={`Rename ${document.name}`}
                            title="Rename"
                            onClick={(event) => {
                              event.stopPropagation();
                              beginRename(document);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Duplicate ${document.name}`}
                            title="Duplicate"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDuplicate(document.id);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${document.name}`}
                            title="Delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteTarget(document);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger/[0.06] hover:text-danger"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {isRenaming ? (
                        <input
                          autoFocus
                          value={renameDraft}
                          maxLength={80}
                          onChange={(event) => setRenameDraft(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onBlur={() => commitRename(document)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              commitRename(document);
                            }
                            if (event.key === "Escape") {
                              cancelRename.current = true;
                              setRenameDraft(document.name);
                              setRenamingId(null);
                            }
                          }}
                          aria-label="Document name"
                          className="mt-3 h-8 w-full rounded-md border border-line bg-white px-2 text-[14px] font-semibold text-ink outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      ) : (
                        <h2 className="mt-3 truncate text-[14px] font-semibold tracking-tight text-ink">
                          {document.name}
                        </h2>
                      )}

                      <p className="mt-1 line-clamp-2 min-h-[32px] text-[12px] leading-relaxed text-muted">
                        {getExcerpt(document.content, 130)}
                      </p>

                      <div className="mt-4 flex items-center gap-2 border-t border-line/80 pt-3 text-[10.5px] text-muted">
                        <span>{formatRelativeDate(document.updatedAt)}</span>
                        <span className="h-2.5 w-px bg-line" />
                        <span>{countWords(document.content)} words</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        options={
          deleteTarget
            ? {
                title: "Delete this document?",
                description: `“${deleteTarget.name}” and its Markdown will be permanently removed from this browser. This cannot be undone.`,
                confirmLabel: "Delete document",
                destructive: true,
                onConfirm: () => {
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                },
              }
            : null
        }
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
