import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, FileText, Pencil } from "lucide-react";
import type {
  EditorFontSize,
  EditorMode,
  FormatAction,
  FormatResult,
  MarkdownBlock,
  MarkdownEditorHandle,
} from "../types";
import {
  applyFormat,
  insertBlock,
  parseMarkdownBlocks,
} from "../lib/markdown";
import { MarkdownBody } from "./MarkdownBody";

interface EditingBlock {
  index: number;
  prefix: string;
  suffix: string;
  draft: string;
  blocks: MarkdownBlock[];
}

interface MarkdownEditorProps {
  value: string;
  mode: EditorMode;
  fontSize: EditorFontSize;
  onChange: (value: string) => void;
}

const fontClasses: Record<EditorFontSize, string> = {
  sm: "editor-font-sm",
  md: "editor-font-md",
  lg: "editor-font-lg",
};

function actionToSnippet(action: FormatAction): string {
  switch (action.type) {
    case "wrap":
      return `${action.before}${action.placeholder}${action.after}`;
    case "linePrefix":
      return `${action.ordered ? "1. " : action.prefix}Your text here`;
    case "insert":
      return action.text;
    case "link":
      return "[link text](https://example.com)";
    case "image":
      return "![Alt text](https://example.com/image.png)";
    default:
      return "";
  }
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, mode, fontSize, onChange }, ref) {
    const blocks = useMemo(() => parseMarkdownBlocks(value), [value]);
    const [editing, setEditing] = useState<EditingBlock | null>(null);
    const rawRef = useRef<HTMLTextAreaElement | null>(null);
    const blockRef = useRef<HTMLTextAreaElement | null>(null);
    const pendingSelection = useRef<[number, number] | null>(null);
    const shouldRefocus = useRef(false);
    const rawTouched = useRef(false);

    const finishEditing = () => {
      setEditing(null);
      pendingSelection.current = null;
    };

    const startEditing = (index: number, sourceBlocks: MarkdownBlock[]) => {
      const block = sourceBlocks[index];
      if (!block) return;
      setEditing({
        index,
        prefix: value.slice(0, block.start),
        suffix: value.slice(block.end),
        draft: block.raw,
        blocks: sourceBlocks,
      });
      shouldRefocus.current = true;
    };

    const startEmptyEditing = () => {
      setEditing({
        index: 0,
        prefix: value,
        suffix: "",
        draft: "",
        blocks: [],
      });
      shouldRefocus.current = true;
    };

    const updateDraft = (nextDraft: string, selection?: [number, number]) => {
      if (!editing) return;
      setEditing((current) => (current ? { ...current, draft: nextDraft } : current));
      onChange(editing.prefix + nextDraft + editing.suffix);
      if (selection) {
        pendingSelection.current = selection;
        shouldRefocus.current = true;
      }
    };

    const updateAtTarget = (
      actionOrSnippet: { type: "format"; action: FormatAction } | { type: "snippet"; snippet: string },
    ) => {
      if (editing) {
        const element = blockRef.current;
        const start = element?.selectionStart ?? editing.draft.length;
        const end = element?.selectionEnd ?? editing.draft.length;
        const result: FormatResult =
          actionOrSnippet.type === "snippet"
            ? insertBlock(editing.draft, start, end, actionOrSnippet.snippet)
            : applyFormat(editing.draft, start, end, actionOrSnippet.action);
        updateDraft(result.text, [result.selectionStart, result.selectionEnd]);
        return;
      }

      if (mode === "raw" && rawRef.current) {
        const element = rawRef.current;
        const start = rawTouched.current ? element.selectionStart ?? 0 : value.length;
        const end = rawTouched.current ? element.selectionEnd ?? start : value.length;
        const result: FormatResult =
          actionOrSnippet.type === "snippet"
            ? insertBlock(value, start, end, actionOrSnippet.snippet)
            : applyFormat(value, start, end, actionOrSnippet.action);
        onChange(result.text);
        pendingSelection.current = [result.selectionStart, result.selectionEnd];
        shouldRefocus.current = true;
        return;
      }

      const snippet =
        actionOrSnippet.type === "snippet"
          ? actionOrSnippet.snippet
          : actionToSnippet(actionOrSnippet.action);
      const result = insertBlock(value, value.length, value.length, snippet);
      onChange(result.text);
      pendingSelection.current = [result.selectionStart, result.selectionEnd];
    };

    useImperativeHandle(
      ref,
      () => ({
        applyFormat(action) {
          updateAtTarget({ type: "format", action });
        },
        insertSnippet(snippet) {
          updateAtTarget({ type: "snippet", snippet });
        },
        focus() {
          if (editing && blockRef.current) {
            blockRef.current.focus();
          } else {
            rawRef.current?.focus();
          }
        },
      }),
      // The editor API intentionally follows the current document and mode.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [editing, mode, value, onChange],
    );

    useLayoutEffect(() => {
      if (!pendingSelection.current) return;
      const element = editing ? blockRef.current : rawRef.current;
      if (!element) return;
      if (shouldRefocus.current) {
        element.focus();
        shouldRefocus.current = false;
      }
      element.setSelectionRange(pendingSelection.current[0], pendingSelection.current[1]);
      pendingSelection.current = null;
    }, [value, editing?.draft, editing?.index, editing, mode]);

    useEffect(() => {
      if (!editing) return;
      const frame = window.requestAnimationFrame(() => {
        const element = blockRef.current;
        if (!element) return;
        element.style.height = "auto";
        element.style.height = `${Math.max(72, element.scrollHeight)}px`;
        if (shouldRefocus.current) {
          element.focus();
          element.setSelectionRange(element.value.length, element.value.length);
          shouldRefocus.current = false;
        }
      });
      return () => window.cancelAnimationFrame(frame);
    }, [editing?.index, editing]);

    useEffect(() => {
      if (!editing) return;
      if (!(value.startsWith(editing.prefix) && value.endsWith(editing.suffix))) {
        setEditing(null);
      }
    }, [value, editing]);

    const renderEditingCard = () => {
      if (!editing) return null;
      return (
        <div className="visual-block visual-block--editing">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              <Pencil size={11} />
              Markdown source
            </span>
            <button
              type="button"
              onClick={finishEditing}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-ink transition-colors hover:bg-canvas"
            >
              <Check size={13} />
              Done
            </button>
          </div>
          <textarea
            ref={blockRef}
            data-markdown-editor
            value={editing.draft}
            spellCheck
            onChange={(event) => updateDraft(event.target.value)}
            onFocus={(event) => {
              event.currentTarget.style.height = "auto";
              event.currentTarget.style.height = `${Math.max(
                72,
                event.currentTarget.scrollHeight,
              )}px`;
            }}
            onInput={(event) => {
              const element = event.currentTarget;
              element.style.height = "auto";
              element.style.height = `${Math.max(72, element.scrollHeight)}px`;
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" || (event.key === "Enter" && (event.metaKey || event.ctrlKey))) {
                event.preventDefault();
                finishEditing();
              }
            }}
            placeholder="Write Markdown for this block…"
            className="block-editor-textarea"
          />
          <p className="mt-2 text-[11px] text-muted">Esc or Ctrl + Enter to finish</p>
        </div>
      );
    };

    const displayedBlocks = editing ? editing.blocks : blocks;

    if (mode === "raw") {
      return (
        <div className={`raw-editor-wrap ${fontClasses[fontSize]}`}>
          <textarea
            ref={rawRef}
            data-markdown-editor
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => {
              rawTouched.current = true;
            }}
            onSelect={() => {
              rawTouched.current = true;
            }}
            onClick={() => {
              rawTouched.current = true;
            }}
            placeholder="Start writing your README in Markdown…"
            spellCheck={false}
            className="raw-editor-textarea"
            aria-label="Raw Markdown editor"
          />
        </div>
      );
    }

    return (
      <div className={`visual-editor ${fontClasses[fontSize]}`}>
        {editing ? (
          <>
            {displayedBlocks.slice(0, editing.index).map((block) => (
              <div key={block.id} className="visual-block visual-block--muted">
                <MarkdownBody markdown={block.raw} variant="editor" />
              </div>
            ))}
            {renderEditingCard()}
            {displayedBlocks.slice(editing.index + 1).map((block) => (
              <div key={block.id} className="visual-block visual-block--muted">
                <MarkdownBody markdown={block.raw} variant="editor" />
              </div>
            ))}
          </>
        ) : blocks.length > 0 ? (
          blocks.map((block, index) => (
            <div
              key={block.id}
              role="button"
              tabIndex={0}
              aria-label={`Edit ${block.type.toLowerCase()} block`}
              onClick={() => startEditing(index, blocks)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  startEditing(index, blocks);
                }
              }}
              className="visual-block group cursor-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <span className="visual-block-hint" aria-hidden="true">
                <Pencil size={11} />
                Edit
              </span>
              <div className="pointer-events-none">
                <MarkdownBody markdown={block.raw} variant="editor" />
              </div>
            </div>
          ))
        ) : (
          <button
            type="button"
            onClick={startEmptyEditing}
            className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D9D9DE] bg-[#FCFCFD] px-8 py-16 text-center transition-colors hover:border-[#C7C7CC] hover:bg-canvas/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-muted shadow-sm">
              <FileText size={19} strokeWidth={1.7} />
            </span>
            <span className="text-[15px] font-medium text-ink">Start with your first line</span>
            <span className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">
              Click here to write. Add a title with the H1 button, then build the rest of your README.
            </span>
          </button>
        )}
      </div>
    );
  },
);
