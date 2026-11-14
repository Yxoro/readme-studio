import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { AIConfig } from "../lib/ai";
import { DEFAULT_AI_CONFIG, testAIConnection } from "../lib/ai";
import { Modal } from "./Modal";

interface AISettingsModalProps {
  open: boolean;
  config: AIConfig;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
}

interface ConnectionResult {
  type: "success" | "error";
  message: string;
}

const inputClass =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-[12.5px] text-ink outline-none transition-shadow placeholder:text-[#A1A1A6] focus:ring-2 focus:ring-accent/15";

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Connection failed.";
}

export function AISettingsModal({ open, config, onClose, onSave }: AISettingsModalProps) {
  const [draft, setDraft] = useState<AIConfig>(config);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(config);
    setShowKey(false);
    setTesting(false);
    setResult(null);
  }, [open, config]);

  const trimmedConfig = (): AIConfig => ({
    baseUrl: draft.baseUrl.trim(),
    model: draft.model.trim(),
    apiKey: draft.apiKey.trim(),
  });

  const validate = (): string | null => {
    const next = trimmedConfig();
    if (!next.baseUrl) return "Enter the API base URL.";
    if (!/^https?:\/\/\S+$/i.test(next.baseUrl)) {
      return "The API base URL must be a valid http:// or https:// URL.";
    }
    if (!next.model) return "Enter the model name.";
    if (!next.apiKey) return "Enter your API key.";
    return null;
  };

  const handleTest = async () => {
    const validationError = validate();
    if (validationError) {
      setResult({ type: "error", message: validationError });
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      await testAIConnection(trimmedConfig());
      setResult({ type: "success", message: "Connection successful. The model replied." });
    } catch (error) {
      setResult({ type: "error", message: errorMessage(error) });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const validationError = validate();
    if (validationError) {
      setResult({ type: "error", message: validationError });
      return;
    }
    onSave(trimmedConfig());
    onClose();
  };

  const handleRemove = () => {
    onSave({ ...trimmedConfig(), apiKey: "" });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI settings"
      eyebrow="AI assistant"
      description="Connect an OpenAI-compatible provider. Your key is stored only in this browser and sent directly to that endpoint."
      size="md"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          {draft.apiKey ? (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-danger transition-colors hover:bg-danger/[0.05]"
            >
              <Trash2 size={13} />
              Remove key
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-lg border border-line bg-white px-3 text-[12px] font-medium text-ink transition-colors hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-8 rounded-lg bg-accent px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-[#2C6EE4]"
            >
              Save settings
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas/60 px-3.5 py-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-muted shadow-sm">
            <KeyRound size={14} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[12px] font-medium text-ink">Bring your own key</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              README Studio has no backend. Requests go from this browser directly to the
              provider you configure.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="ai-base-url" className="text-[11.5px] font-medium text-ink">
              API base URL
            </label>
            <button
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  baseUrl: DEFAULT_AI_CONFIG.baseUrl,
                  model: DEFAULT_AI_CONFIG.model,
                }))
              }
              className="inline-flex items-center gap-1 text-[10.5px] font-medium text-muted transition-colors hover:text-ink"
            >
              <RotateCcw size={10} />
              Z.ai defaults
            </button>
          </div>
          <input
            id="ai-base-url"
            type="url"
            value={draft.baseUrl}
            onChange={(event) => setDraft((current) => ({ ...current, baseUrl: event.target.value }))}
            placeholder={DEFAULT_AI_CONFIG.baseUrl}
            spellCheck={false}
            className={inputClass}
          />
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
            The app appends <code className="font-mono text-[10px]">/chat/completions</code> unless
            the URL already includes it.
          </p>
        </div>

        <div>
          <label htmlFor="ai-model" className="mb-1.5 block text-[11.5px] font-medium text-ink">
            Model
          </label>
          <input
            id="ai-model"
            type="text"
            value={draft.model}
            onChange={(event) => setDraft((current) => ({ ...current, model: event.target.value }))}
            placeholder="glm-4-flash"
            spellCheck={false}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ai-api-key" className="mb-1.5 block text-[11.5px] font-medium text-ink">
            API key
          </label>
          <div className="relative">
            <input
              id="ai-api-key"
              type={showKey ? "text" : "password"}
              value={draft.apiKey}
              onChange={(event) =>
                setDraft((current) => ({ ...current, apiKey: event.target.value }))
              }
              placeholder="Paste your provider API key"
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} pr-10 font-mono text-[11.5px]`}
            />
            <button
              type="button"
              onClick={() => setShowKey((current) => !current)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
              title={showKey ? "Hide API key" : "Show API key"}
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="mt-1.5 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted">
            <ShieldCheck size={11} className="mt-0.5 shrink-0" />
            Use a dedicated key with a spending limit. It is saved in local storage and never
            sent anywhere except your configured provider.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[11.5px] font-medium text-ink shadow-sm transition-colors hover:bg-canvas disabled:cursor-wait disabled:opacity-60"
          >
            {testing ? <Loader2 size={13} className="animate-spin" /> : null}
            {testing ? "Testing" : "Test connection"}
          </button>
          <span className="text-[10.5px] text-muted">
            Your provider must allow browser requests (CORS).
          </span>
        </div>

        {result && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[11px] leading-relaxed ${
              result.type === "success"
                ? "border-success/20 bg-success/[0.045] text-[#1E6E32]"
                : "border-danger/20 bg-danger/[0.035] text-[#B00012]"
            }`}
          >
            {result.type === "success" ? (
              <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
            )}
            {result.message}
          </div>
        )}
      </div>
    </Modal>
  );
}
