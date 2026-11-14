import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Eraser, FileText, Plus } from "lucide-react";
import type {
  AppSettings,
  AppView,
  ConfirmOptions,
  EditorMode,
  FormatAction,
  MarkdownEditorHandle,
  Template,
  ToastMessage,
} from "./types";
import { useDocuments } from "./hooks/useDocuments";
import { useAutosave } from "./hooks/useAutosave";
import {
  DEFAULT_SETTINGS,
  clearStoredData,
  loadSettings,
  saveDocuments,
  saveSettings,
} from "./lib/storage";
import { copyText, downloadMarkdown, readMarkdownFile } from "./lib/files";
import { clearAIConfig } from "./lib/ai";
import { countWords, getReadingTime } from "./lib/markdown";
import { generateId } from "./lib/format";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { AIPanel } from "./components/AIPanel";
import { MarkdownToolbar } from "./components/MarkdownToolbar";
import { MarkdownEditor } from "./components/MarkdownEditor";
import { PreviewPanel } from "./components/PreviewPanel";
import { TemplateGallery } from "./components/TemplateGallery";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { DocumentManager } from "./components/DocumentManager";
import { DocumentationView } from "./components/DocumentationView";
import { SettingsView } from "./components/SettingsView";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ToastStack } from "./components/ToastStack";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function App() {
  const docs = useDocuments();
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [view, setView] = useState<AppView>("workspace");
  const [mode, setMode] = useState<EditorMode>(settings.defaultEditorMode);
  const [previewOpen, setPreviewOpen] = useState(
    () => settings.previewOpenByDefault && window.innerWidth >= 1280,
  );
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [componentsOpen, setComponentsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const toastTimers = useRef(new Map<string, number>());

  const activeDocument = docs.activeDocument;
  const activeId = activeDocument?.id ?? null;

  const snapshot = useMemo(
    () => ({ documents: docs.documents, activeId: docs.activeId }),
    [docs.documents, docs.activeId],
  );
  const autosave = useAutosave(snapshot, saveDocuments);

  const pushToast = useCallback(
    (message: string, variant: ToastMessage["variant"] = "success") => {
      const id = generateId();
      setToasts((current) => [...current, { id, message, variant }].slice(-3));
      const timer = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        toastTimers.current.delete(id);
      }, 3600);
      toastTimers.current.set(id, timer);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) window.clearTimeout(timer);
    toastTimers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    setMode(settings.defaultEditorMode);
  }, [settings.defaultEditorMode]);

  useEffect(() => {
    if (window.innerWidth >= 1280) {
      setPreviewOpen(settings.previewOpenByDefault);
    }
  }, [settings.previewOpenByDefault]);

  useEffect(() => {
    try {
      saveSettings(settings);
    } catch {
      pushToast("Preferences could not be saved in this browser.", "error");
    }
  }, [settings, pushToast]);

  useEffect(() => {
    if (autosave.status === "error") {
      pushToast("Changes could not be saved. Browser storage may be full.", "error");
    }
  }, [autosave.status, pushToast]);

  useEffect(() => {
    const saveBeforeLeaving = () => {
      try {
        saveDocuments({ documents: docs.documents, activeId: docs.activeId });
      } catch {
        // The regular autosave status reports storage failures.
      }
    };
    window.addEventListener("beforeunload", saveBeforeLeaving);
    return () => window.removeEventListener("beforeunload", saveBeforeLeaving);
  }, [docs.documents, docs.activeId]);

  const handleSettingsChange = useCallback((partial: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...partial }));
  }, []);

  const handleNewDocument = useCallback(() => {
    docs.createDocument();
    setView("workspace");
    setTemplatesOpen(false);
    setComponentsOpen(false);
    setAiOpen(false);
  }, [docs]);

  const handleOpenDocument = useCallback(
    (id: string) => {
      docs.openDocument(id);
      setView("workspace");
      setTemplatesOpen(false);
      setComponentsOpen(false);
      setAiOpen(false);
    },
    [docs],
  );

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      docs.createDocument({ name: template.name, content: template.content });
      setTemplatesOpen(false);
      setComponentsOpen(false);
      setView("workspace");
      setAiOpen(false);
      pushToast(`${template.name} template applied.`);
    },
    [docs, pushToast],
  );

  const handlePromoGenerated = useCallback(
    (markdown: string) => {
      const heading = markdown
        .match(/^#\s+(.+)$/m)?.[1]
        ?.replace(/[*_`]/g, "")
        .trim()
        .slice(0, 80);
      docs.createDocument({ name: heading || "Promo README", content: markdown });
      setView("workspace");
      setTemplatesOpen(false);
      setComponentsOpen(false);
      pushToast("Promotional README created.");
    },
    [docs, pushToast],
  );

  const handleOpenComponents = useCallback(() => {
    if (!docs.activeDocument) {
      docs.createDocument();
    }
    setView("workspace");
    setTemplatesOpen(false);
    setComponentsOpen(true);
  }, [docs]);

  const handleComponentInsert = useCallback(
    (section: { name: string; content: string }) => {
      if (!editorRef.current) {
        pushToast("Open a README before inserting a component.", "error");
        return;
      }
      editorRef.current.insertSnippet(section.content);
      setComponentsOpen(false);
      pushToast(`${section.name} inserted at the cursor.`);
    },
    [pushToast],
  );

  const handleForceSave = useCallback(() => {
    const saved = autosave.saveNow();
    pushToast(
      saved ? "All changes saved locally." : "Could not save your changes locally.",
      saved ? "success" : "error",
    );
  }, [autosave, pushToast]);

  const handleUndo = useCallback(() => {
    if (activeId) docs.undo(activeId);
  }, [activeId, docs]);

  const handleRedo = useCallback(() => {
    if (activeId) docs.redo(activeId);
  }, [activeId, docs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;

      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      const isMarkdownEditor =
        target instanceof HTMLTextAreaElement && target.hasAttribute("data-markdown-editor");
      const isField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.isContentEditable);

      if (key === "s") {
        event.preventDefault();
        handleForceSave();
        return;
      }

      if (key !== "z" && key !== "y") return;
      if (isField && !isMarkdownEditor) return;
      if (!activeId) return;

      event.preventDefault();
      if (key === "y" || event.shiftKey) {
        docs.redo(activeId);
      } else {
        docs.undo(activeId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, docs, handleForceSave]);

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const content = await readMarkdownFile(file);
        const name = file.name.replace(/\.(md|markdown|mdown|txt)$/i, "").trim();
        docs.createDocument({ name: name || "Imported README", content });
        setView("workspace");
        setTemplatesOpen(false);
        setComponentsOpen(false);
        setAiOpen(false);
        pushToast(`Imported “${name || file.name}”.`);
      } catch (error) {
        pushToast(getErrorMessage(error, "Could not import that file."), "error");
      }
    },
    [docs, pushToast],
  );

  const handleExport = useCallback(() => {
    if (!activeDocument) return;
    try {
      downloadMarkdown(activeDocument.content);
      pushToast("README.md exported.");
    } catch (error) {
      pushToast(getErrorMessage(error, "Could not export README.md."), "error");
    }
  }, [activeDocument, pushToast]);

  const handleCopy = useCallback(async () => {
    if (!activeDocument) return;
    try {
      await copyText(activeDocument.content);
      pushToast("Markdown copied to clipboard.");
    } catch (error) {
      pushToast(getErrorMessage(error, "Could not copy Markdown."), "error");
    }
  }, [activeDocument, pushToast]);

  const handleClearDocument = useCallback(() => {
    if (!activeDocument) return;
    setConfirmOptions({
      title: "Clear this document?",
      description: `All Markdown will be removed from “${activeDocument.name}”. The document itself stays in your workspace, and you can undo this change.`,
      confirmLabel: "Clear document",
      destructive: true,
      onConfirm: () => {
        docs.updateContent(activeDocument.id, "");
        setComponentsOpen(false);
        pushToast("Document cleared.");
      },
    });
  }, [activeDocument, docs, pushToast]);

  const handleDeleteDocument = useCallback(
    (id: string) => {
      const document = docs.documents.find((candidate) => candidate.id === id);
      docs.deleteDocument(id);
      setAiOpen(false);
      if (document) pushToast(`“${document.name}” deleted.`);
    },
    [docs, pushToast],
  );

  const handleDuplicateDocument = useCallback(
    (id: string) => {
      const newId = docs.duplicateDocument(id);
      if (newId) pushToast("Document duplicated.");
    },
    [docs, pushToast],
  );

  const handleResetData = useCallback(() => {
    setConfirmOptions({
      title: "Delete all local data?",
      description:
        "Every README document, preference and AI API key will be permanently removed from this browser. This cannot be undone. Export important documents first.",
      confirmLabel: "Delete everything",
      destructive: true,
      onConfirm: () => {
        try {
          clearStoredData();
        } catch {
          // State is still cleared below even if storage access is restricted.
        }
        docs.clearAllDocuments();
        clearAIConfig();
        setSettings({ ...DEFAULT_SETTINGS });
        setTemplatesOpen(false);
        setComponentsOpen(false);
        setAiOpen(false);
        setView("workspace");
        pushToast("All local data deleted.");
      },
    });
  }, [docs, pushToast]);

  const handleNavigate = useCallback((nextView: AppView) => {
    setView(nextView);
    setTemplatesOpen(false);
    setComponentsOpen(false);
    setAiOpen(false);
  }, []);

  const handleHome = useCallback(() => {
    setView("workspace");
    setTemplatesOpen(false);
    setComponentsOpen(false);
  }, []);

  const handleTogglePreview = useCallback(() => {
    if (!activeDocument) return;
    if (view !== "workspace") setView("workspace");
    const nextPreview = !previewOpen;
    setPreviewOpen(nextPreview);
    if (nextPreview) setAiOpen(false);
  }, [activeDocument, view, previewOpen]);

  const handleToggleAI = useCallback(() => {
    if (!docs.activeDocument) docs.createDocument();
    setView("workspace");
    setTemplatesOpen(false);
    setComponentsOpen(false);
    if (aiOpen) {
      setAiOpen(false);
      return;
    }
    setAiOpen(true);
    setPreviewOpen(false);
  }, [aiOpen, docs]);

  const statistics = useMemo(() => {
    const content = activeDocument?.content ?? "";
    const words = countWords(content);
    return {
      words,
      characters: content.length,
      readingTime: getReadingTime(words),
      hasContent: content.trim().length > 0,
    };
  }, [activeDocument?.content]);

  const editorDisabled = !activeDocument;

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        view={view}
        documents={docs.documents}
        activeId={activeId}
        templatesOpen={templatesOpen}
        componentsOpen={componentsOpen}
        onNavigate={handleNavigate}
        onOpenTemplates={() => {
          setTemplatesOpen(true);
          setComponentsOpen(false);
        }}
        onOpenComponents={handleOpenComponents}
        onNewDocument={handleNewDocument}
        onOpenDocument={handleOpenDocument}
        onHome={handleHome}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          document={activeDocument}
          saveStatus={autosave.status}
          lastSavedAt={autosave.lastSavedAt}
          canUndo={activeId ? docs.canUndo(activeId) : false}
          canRedo={activeId ? docs.canRedo(activeId) : false}
          previewOpen={previewOpen}
          aiOpen={aiOpen}
          onRename={(name) => activeId && docs.renameDocument(activeId, name)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onImportFile={handleImportFile}
          onExport={handleExport}
          onTogglePreview={handleTogglePreview}
          onToggleAI={handleToggleAI}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex min-h-0 flex-1 flex-col">
          {view === "workspace" &&
            (activeDocument ? (
              <div className="relative flex min-h-0 flex-1">
                <section
                  aria-label="README editor"
                  className="flex min-h-0 min-w-0 flex-1 flex-col bg-white"
                >
                  <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line px-3 sm:px-4">
                    <div
                      role="tablist"
                      aria-label="Editor mode"
                      className="inline-flex rounded-lg bg-canvas p-0.5"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "visual"}
                        onClick={() => setMode("visual")}
                        className={`h-7 rounded-md px-2.5 text-[11.5px] font-medium transition-all ${
                          mode === "visual"
                            ? "bg-white text-ink shadow-sm"
                            : "text-muted hover:text-ink"
                        }`}
                      >
                        Visual Editor
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "raw"}
                        onClick={() => setMode("raw")}
                        className={`h-7 rounded-md px-2.5 text-[11.5px] font-medium transition-all ${
                          mode === "raw"
                            ? "bg-white text-ink shadow-sm"
                            : "text-muted hover:text-ink"
                        }`}
                      >
                        Raw Markdown
                      </button>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className="hidden items-center gap-1.5 text-[11px] text-muted sm:flex">
                        <FileText size={12} />
                        {mode === "visual" ? "Click any block to edit" : "Markdown source"}
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenComponents}
                        title="Add component"
                        aria-label="Add component"
                        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-white px-2 text-[11px] font-medium text-[#515154] shadow-sm transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
                      >
                        <Plus size={13} strokeWidth={2.2} />
                        <span className="hidden sm:inline">Add component</span>
                      </button>
                    </div>
                  </div>

                  <MarkdownToolbar
                    onAction={(action: FormatAction) => editorRef.current?.applyFormat(action)}
                  />

                  <div className="min-h-0 flex-1 overflow-hidden">
                    <MarkdownEditor
                      key={`${activeDocument.id}-${mode}`}
                      ref={editorRef}
                      value={activeDocument.content}
                      mode={mode}
                      fontSize={settings.editorFontSize}
                      onChange={(content) => docs.updateContent(activeDocument.id, content)}
                    />
                  </div>

                  <footer className="flex h-10 shrink-0 items-center justify-between gap-3 overflow-hidden border-t border-line px-3 text-[11px] text-muted sm:px-4">
                    <div className="flex min-w-0 items-center gap-3 whitespace-nowrap sm:gap-4">
                      <span>
                        <strong className="font-medium tabular-nums text-[#515154]">
                          {statistics.words.toLocaleString("en-US")}
                        </strong>{" "}
                        words
                      </span>
                      <span className="hidden sm:inline">
                        <strong className="font-medium tabular-nums text-[#515154]">
                          {statistics.characters.toLocaleString("en-US")}
                        </strong>{" "}
                        characters
                      </span>
                      <span>
                        {statistics.readingTime === 0
                          ? "0 min read"
                          : `${statistics.readingTime} min read`}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={editorDisabled || !statistics.hasContent}
                        title="Copy Markdown"
                        className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-[#515154] transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Copy size={12} />
                        <span className="hidden md:inline">Copy Markdown</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearDocument}
                        disabled={editorDisabled || !statistics.hasContent}
                        title="Clear document"
                        className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-[#515154] transition-colors hover:bg-canvas hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Eraser size={12} />
                        <span className="hidden md:inline">Clear</span>
                      </button>
                    </div>
                  </footer>
                </section>

                {aiOpen ? (
                  <aside
                    aria-label="AI assistant"
                    className="flex min-h-0 flex-col border-line bg-white max-xl:absolute max-xl:inset-0 max-xl:z-20 max-xl:shadow-lift xl:w-[412px] xl:min-w-[372px] xl:max-w-[460px] xl:border-l"
                  >
                    <AIPanel
                      document={activeDocument}
                      onApplyContent={(content) =>
                        docs.updateContent(activeDocument.id, content)
                      }
                      onPromoGenerated={handlePromoGenerated}
                      onClose={() => setAiOpen(false)}
                    />
                  </aside>
                ) : previewOpen ? (
                  <aside
                    aria-label="README preview"
                    className="flex min-h-0 flex-col border-line bg-white max-xl:absolute max-xl:inset-0 max-xl:z-20 max-xl:shadow-lift xl:w-[44%] xl:min-w-[390px] xl:max-w-[820px] xl:border-l"
                  >
                    <PreviewPanel
                      markdown={activeDocument.content}
                      onClose={() => setPreviewOpen(false)}
                    />
                  </aside>
                ) : null}
              </div>
            ) : (
              <WelcomeScreen
                onNewDocument={handleNewDocument}
                onOpenTemplates={() => setTemplatesOpen(true)}
              />
            ))}

          {view === "projects" && (
            <DocumentManager
              documents={docs.documents}
              activeId={activeId}
              onOpen={handleOpenDocument}
              onCreate={handleNewDocument}
              onOpenTemplates={() => setTemplatesOpen(true)}
              onRename={(id, name) => docs.renameDocument(id, name)}
              onDuplicate={handleDuplicateDocument}
              onDelete={handleDeleteDocument}
            />
          )}

          {view === "documentation" && (
            <DocumentationView
              onNewDocument={handleNewDocument}
              onOpenTemplates={() => setTemplatesOpen(true)}
            />
          )}

          {view === "settings" && (
            <SettingsView
              settings={settings}
              documents={docs.documents}
              onChange={handleSettingsChange}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      <TemplateGallery
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelect={handleTemplateSelect}
      />

      <ComponentLibrary
        open={componentsOpen}
        onClose={() => setComponentsOpen(false)}
        onInsert={handleComponentInsert}
      />

      <ConfirmDialog options={confirmOptions} onClose={() => setConfirmOptions(null)} />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
