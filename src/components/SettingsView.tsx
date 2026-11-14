import type { ReactNode } from "react";
import { Database, HardDrive, Info, SlidersHorizontal, Trash2 } from "lucide-react";
import type { AppSettings, EditorFontSize, EditorMode, ReadmeDocument } from "../types";
import { formatBytes, getStorageSize } from "../lib/format";
import { Logo } from "./Logo";

interface SettingsViewProps {
  settings: AppSettings;
  documents: ReadmeDocument[];
  onChange: (partial: Partial<AppSettings>) => void;
  onResetData: () => void;
}

export function SettingsView({ settings, documents, onChange, onResetData }: SettingsViewProps) {
  return (
    <div className="view-scroll">
      <div className="mx-auto w-full max-w-3xl px-6 py-9 sm:px-8 lg:py-11">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
          Preferences
        </p>
        <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">Settings</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Adjust the writing experience. Changes are saved instantly on this device.
        </p>

        <section className="mt-7 rounded-2xl border border-line bg-white shadow-card">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <SlidersHorizontal size={13} className="text-muted" />
              Editor
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted">How your Markdown workspace behaves.</p>
          </div>

          <SettingRow
            title="Editor text size"
            description="Adjust the size of text in both editing modes."
          >
            <SegmentedControl<EditorFontSize>
              value={settings.editorFontSize}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Default" },
                { value: "lg", label: "Large" },
              ]}
              onChange={(value) => onChange({ editorFontSize: value })}
              ariaLabel="Editor text size"
            />
          </SettingRow>

          <SettingRow
            title="Default editing mode"
            description="The editor surface used when the workspace opens."
          >
            <SegmentedControl<EditorMode>
              value={settings.defaultEditorMode}
              options={[
                { value: "visual", label: "Visual" },
                { value: "raw", label: "Raw Markdown" },
              ]}
              onChange={(value) => onChange({ defaultEditorMode: value })}
              ariaLabel="Default editing mode"
            />
          </SettingRow>

          <SettingRow
            title="Show preview by default"
            description="Open the live preview panel with the editor."
            last
          >
            <button
              type="button"
              role="switch"
              aria-checked={settings.previewOpenByDefault}
              aria-label="Show preview by default"
              onClick={() => onChange({ previewOpenByDefault: !settings.previewOpenByDefault })}
              className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 ${
                settings.previewOpenByDefault ? "bg-accent" : "bg-[#D9D9DE]"
              }`}
            >
              <span
                className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                  settings.previewOpenByDefault ? "translate-x-[19px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          </SettingRow>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-white shadow-card">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <Database size={13} className="text-muted" />
              Local data
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              README Studio has no backend. Everything lives in this browser.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-muted">
                <Database size={15} strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[12.5px] font-medium text-ink">Stored documents</p>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  {documents.length} document{documents.length === 1 ? "" : "s"} ·{" "}
                  {formatBytes(getStorageSize(documents))} of Markdown
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResetData}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-danger/20 bg-white px-3 text-[12px] font-medium text-danger transition-colors hover:bg-danger/[0.04]"
            >
              <Trash2 size={13} />
              Delete all data
            </button>
          </div>
          <div className="border-t border-line px-5 py-3.5">
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted">
              <HardDrive size={12} className="mt-0.5 shrink-0" />
              Your documents and AI credentials are never uploaded by README Studio. Clearing
              browser storage or selecting Delete all data removes them permanently.
            </p>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex items-start gap-4">
            <Logo className="w-[132px] shrink-0" />
            <div className="min-w-0 flex-1 border-l border-line pl-4">
              <p className="text-[12.5px] font-medium text-ink">README Studio 1.0.0</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                A local-first workspace for thoughtful README files.
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-muted">
                <Info size={11} />
                React, TypeScript, Vite and Tailwind CSS.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

interface SettingRowProps {
  title: string;
  description: string;
  children: ReactNode;
  last?: boolean;
}

function SettingRow({ title, description, children, last = false }: SettingRowProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${
        last ? "" : "border-b border-line/80"
      }`}
    >
      <div className="max-w-sm">
        <p className="text-[12.5px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex shrink-0 rounded-lg bg-canvas p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`h-7 rounded-md px-2.5 text-[11.5px] font-medium transition-all ${
            value === option.value
              ? "bg-white text-ink shadow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
