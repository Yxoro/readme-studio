import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUp,
  CheckCircle2,
  KeyRound,
  Loader2,
  Megaphone,
  MessageSquare,
  Settings2,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import type { ReadmeDocument } from "../types";
import {
  buildEditMessages,
  buildPromoMessages,
  isAIConfigured,
  loadAIConfig,
  sanitizeMarkdownResponse,
  saveAIConfig,
  streamChatCompletion,
  type AIConfig,
} from "../lib/ai";
import { generateId } from "../lib/format";
import { AISettingsModal } from "./AISettingsModal";
import { MarkdownBody } from "./MarkdownBody";

interface AIPanelProps {
  document: ReadmeDocument;
  onApplyContent: (content: string) => void;
  onPromoGenerated: (markdown: string) => void;
  onClose: () => void;
}

interface ChatEntry {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
}

type AITab = "chat" | "promo";

const editSuggestions = [
  "Make this README clearer and more concise.",
  "Improve the installation and usage sections.",
  "Add a polished features section with a table.",
  "Fix grammar and tighten the tone.",
];

const promoExamples = [
  "A calm weekly planner for people with too many open loops.",
  "An AI meeting companion that turns notes into decisions.",
  "A local-first finance tracker for freelancers.",
];

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "The AI request failed.";
}

function isAbort(error: unknown, controller: AbortController): boolean {
  return (
    controller.signal.aborted ||
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export function AIPanel({
  document,
  onApplyContent,
  onPromoGenerated,
  onClose,
}: AIPanelProps) {
  const [config, setConfig] = useState<AIConfig>(() => loadAIConfig());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<AITab>("chat");
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [promoIdea, setPromoIdea] = useState("");
  const [promoDraft, setPromoDraft] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoDone, setPromoDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const configured = isAIConfigured(config);
  const isGenerating = busy || promoBusy;

  useEffect(() => {
    abortRef.current?.abort();
  }, [document.id]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  const saveConfig = (next: AIConfig) => {
    setConfig(next);
    try {
      saveAIConfig(next);
    } catch {
      // The key remains usable for this session even if storage is unavailable.
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleSend = async (override?: string) => {
    if (busy || promoBusy) return;
    const instruction = (override ?? input).trim();
    if (!instruction) return;
    if (!configured) {
      setSettingsOpen(true);
      return;
    }

    setBusy(true);
    setInput("");
    setMessages((current) => [
      ...current,
      { id: generateId(), role: "user", content: instruction },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    let accumulated = "";
    let frame: number | null = null;
    let latest = "";

    const queueApply = (text: string) => {
      latest = text;
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        onApplyContent(latest);
      });
    };

    try {
      await streamChatCompletion(
        config,
        buildEditMessages(document.content, instruction),
        (delta) => {
          accumulated += delta;
          queueApply(sanitizeMarkdownResponse(accumulated));
        },
        controller.signal,
      );

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }

      const finalMarkdown = sanitizeMarkdownResponse(accumulated).trim();
      if (!finalMarkdown) throw new Error("The AI returned an empty README.");
      onApplyContent(finalMarkdown);
      setMessages((current) => [
        ...current,
        {
          id: generateId(),
          role: "assistant",
          content: `README updated live (${finalMarkdown.length.toLocaleString()} characters). Review the editor, then undo with Ctrl / ⌘ + Z if needed.`,
        },
      ]);
    } catch (error) {
      if (frame !== null) window.cancelAnimationFrame(frame);
      setMessages((current) => [
        ...current,
        {
          id: generateId(),
          role: "error",
          content: isAbort(error, controller)
            ? "Editing stopped. Partial AI changes remain in the editor."
            : errorMessage(error),
        },
      ]);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const handleGeneratePromo = async () => {
    if (promoBusy || busy) return;
    if (!configured) {
      setSettingsOpen(true);
      return;
    }
    const idea = promoIdea.trim();
    if (!idea) {
      setPromoError("Describe the idea in a sentence or two first.");
      return;
    }

    setPromoBusy(true);
    setPromoError(null);
    setPromoDraft("");
    setPromoDone(false);

    const controller = new AbortController();
    abortRef.current = controller;
    let accumulated = "";

    try {
      await streamChatCompletion(
        config,
        buildPromoMessages(idea),
        (delta) => {
          accumulated += delta;
          setPromoDraft(sanitizeMarkdownResponse(accumulated));
        },
        controller.signal,
      );

      const finalMarkdown = sanitizeMarkdownResponse(accumulated).trim();
      if (!finalMarkdown) throw new Error("The AI returned an empty README.");
      setPromoDraft(finalMarkdown);
      onPromoGenerated(finalMarkdown);
      setPromoDone(true);
      setPromoIdea("");
    } catch (error) {
      setPromoError(
        isAbort(error, controller)
          ? "Generation stopped. The partial preview remains below."
          : errorMessage(error),
      );
    } finally {
      setPromoBusy(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Sparkles size={13} />
          </span>
          <span className="truncate text-[12.5px] font-semibold text-ink">AI Assistant</span>
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              configured ? "bg-success" : "bg-[#C7C7CC]"
            }`}
            title={configured ? "AI provider configured" : "Add an API key to get started"}
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {isGenerating && (
            <button
              type="button"
              onClick={handleStop}
              title="Stop generating"
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line px-2 text-[10.5px] font-medium text-[#515154] transition-colors hover:bg-canvas hover:text-ink"
            >
              <Square size={10} fill="currentColor" />
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="AI settings"
            title="AI settings"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <Settings2 size={15} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI assistant"
            title="Close AI assistant"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex h-10 shrink-0 items-center gap-0.5 border-b border-line px-2.5">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "chat"}
          onClick={() => setTab("chat")}
          className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium transition-colors ${
            tab === "chat" ? "bg-canvas text-ink" : "text-muted hover:text-ink"
          }`}
        >
          <MessageSquare size={12} />
          Chat
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "promo"}
          onClick={() => setTab("promo")}
          className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium transition-colors ${
            tab === "promo" ? "bg-canvas text-ink" : "text-muted hover:text-ink"
          }`}
        >
          <Megaphone size={12} />
          Promo README
        </button>
        <span className="ml-auto max-w-[130px] truncate text-[10px] text-muted" title={document.name}>
          {document.name}
        </span>
      </div>

      {tab === "chat" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {!configured ? (
            <ConnectProvider onOpenSettings={() => setSettingsOpen(true)} />
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 && !busy ? (
                  <div className="flex flex-col items-center px-2 pt-6 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas text-[#515154]">
                      <Sparkles size={17} strokeWidth={1.7} />
                    </span>
                    <h3 className="mt-3 text-[13px] font-semibold text-ink">
                      Edit in plain language
                    </h3>
                    <p className="mt-1 max-w-[280px] text-[11.5px] leading-relaxed text-muted">
                      Ask for a rewrite and watch the README change live in the editor.
                    </p>
                    <div className="mt-4 w-full space-y-1.5">
                      {editSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => void handleSend(suggestion)}
                          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-left text-[11.5px] leading-relaxed text-[#515154] transition-colors hover:border-[#D4D4DA] hover:bg-canvas/60 hover:text-ink"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {messages.map((message) => (
                      <ChatBubble key={message.id} message={message} />
                    ))}
                    {busy && (
                      <div className="mr-auto inline-flex max-w-[90%] items-center gap-2 rounded-2xl rounded-bl-md border border-line bg-[#FCFCFD] px-3.5 py-2.5 text-[11.5px] text-muted">
                        <Loader2 size={13} className="animate-spin text-accent" />
                        Editing the README live
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-line p-3">
                <div className="rounded-xl border border-line bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-accent/15">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    rows={2}
                    disabled={busy}
                    placeholder="Ask AI to improve your README…"
                    aria-label="Message the AI assistant"
                    className="block max-h-32 min-h-[54px] w-full resize-none bg-transparent px-3 pb-1 pt-2.5 text-[12px] leading-relaxed text-ink outline-none placeholder:text-[#A1A1A6] disabled:opacity-60"
                  />
                  <div className="flex items-center justify-between gap-2 px-2 pb-2">
                    <span className="text-[10px] text-muted">Enter to send · Shift + Enter for a new line</span>
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={!input.trim() || busy}
                      aria-label="Send instruction"
                      title="Send instruction"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-[#2C6EE4] disabled:cursor-not-allowed disabled:bg-[#D9D9DE]"
                    >
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={14} />}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-muted">
                  AI edits update the document live. Review changes before publishing.
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {!configured ? (
            <ConnectProvider
              onOpenSettings={() => setSettingsOpen(true)}
              title="Connect a provider to generate"
            />
          ) : (
            <div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Megaphone size={14} />
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold text-ink">Promo README</h3>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                    Turn a raw idea into a complete promotional README. No project details
                    needed — just the concept.
                  </p>
                </div>
              </div>

              <label
                htmlFor="promo-idea"
                className="mb-1.5 mt-4 block text-[11px] font-medium text-ink"
              >
                Your idea
              </label>
              <textarea
                id="promo-idea"
                value={promoIdea}
                onChange={(event) => setPromoIdea(event.target.value)}
                rows={4}
                disabled={promoBusy}
                placeholder="A product, service or concept you want to make feel compelling."
                className="block w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-[12px] leading-relaxed text-ink outline-none transition-shadow placeholder:text-[#A1A1A6] focus:ring-2 focus:ring-accent/15 disabled:opacity-60"
              />

              <div className="mt-2 flex flex-wrap gap-1.5">
                {promoExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    disabled={promoBusy || busy}
                    onClick={() => setPromoIdea(example)}
                    className="rounded-md border border-line bg-white px-2 py-1 text-left text-[10px] leading-relaxed text-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {example}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void handleGeneratePromo()}
                disabled={!promoIdea.trim() || promoBusy || busy}
                className="mt-4 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#2C6EE4] disabled:cursor-not-allowed disabled:bg-[#D9D9DE]"
              >
                {promoBusy ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                {promoBusy ? "Writing your README" : "Generate promotional README"}
              </button>
              <p className="mt-2 text-center text-[10px] text-muted">
                A new README document is created when complete. Existing work is untouched.
              </p>

              {promoError && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/[0.035] px-3 py-2.5 text-[11px] leading-relaxed text-[#B00012]">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  {promoError}
                </div>
              )}

              {promoDone && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-success/20 bg-success/[0.045] px-3 py-2.5 text-[11px] leading-relaxed text-[#1E6E32]">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                  Promotional README created as a new document and opened in the editor.
                </div>
              )}

              {promoBusy && !promoDraft && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-[#FCFCFD] px-3.5 py-4 text-[11.5px] text-muted">
                  <Loader2 size={14} className="animate-spin text-accent" />
                  Shaping the concept and writing Markdown…
                </div>
              )}

              {promoDraft && (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                      Live preview
                    </span>
                    <span className="text-[10px] tabular-nums text-muted">
                      {promoDraft.length.toLocaleString()} chars
                    </span>
                  </div>
                  <div className="ai-markdown-preview rounded-xl border border-line bg-white">
                    <MarkdownBody markdown={promoDraft} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <AISettingsModal
        open={settingsOpen}
        config={config}
        onClose={() => setSettingsOpen(false)}
        onSave={saveConfig}
      />
    </div>
  );
}

function ChatBubble({ message }: { message: ChatEntry }) {
  if (message.role === "user") {
    return (
      <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-[11.5px] leading-relaxed text-white">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  if (message.role === "error") {
    return (
      <div className="mr-auto flex max-w-[92%] items-start gap-2 rounded-2xl rounded-bl-md border border-danger/20 bg-danger/[0.035] px-3.5 py-2.5 text-[11px] leading-relaxed text-[#B00012]">
        <AlertCircle size={13} className="mt-0.5 shrink-0" />
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  return (
    <div className="mr-auto flex max-w-[92%] items-start gap-2 rounded-2xl rounded-bl-md border border-line bg-[#FCFCFD] px-3.5 py-2.5 text-[11px] leading-relaxed text-[#515154]">
      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" />
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}

function ConnectProvider({
  onOpenSettings,
  title = "Connect your AI provider",
}: {
  onOpenSettings: () => void;
  title?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-7 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-canvas text-[#515154]">
        <KeyRound size={18} strokeWidth={1.7} />
      </span>
      <h3 className="mt-4 text-[13.5px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-[290px] text-[11.5px] leading-relaxed text-muted">
        Add an API key for an OpenAI-compatible provider. Your key stays in this browser and
        is sent only to the endpoint you choose.
      </p>
      <button
        type="button"
        onClick={onOpenSettings}
        className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-[#2C6EE4]"
      >
        <Settings2 size={13} />
        Add API key
      </button>
      <p className="mt-4 max-w-[270px] text-[10px] leading-relaxed text-muted">
        Tip: use a dedicated key with a spending limit. Some providers block direct browser
        requests; if so, use an endpoint that allows CORS.
      </p>
    </div>
  );
}
