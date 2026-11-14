import { useMemo, useState } from "react";
import { Eye, PanelRightClose, ShieldCheck } from "lucide-react";
import { analyzeReadme } from "../lib/qualityChecker";
import { LivePreview } from "./LivePreview";
import { QualityChecker } from "./QualityChecker";

interface PreviewPanelProps {
  markdown: string;
  onClose: () => void;
}

type PreviewTab = "preview" | "quality";

export function PreviewPanel({ markdown, onClose }: PreviewPanelProps) {
  const [tab, setTab] = useState<PreviewTab>("preview");
  const report = useMemo(() => analyzeReadme(markdown), [markdown]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-3">
        <div
          role="tablist"
          aria-label="Preview panel"
          className="inline-flex rounded-lg bg-canvas p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "preview"}
            onClick={() => setTab("preview")}
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${
              tab === "preview" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <Eye size={13} />
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "quality"}
            onClick={() => setTab("quality")}
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${
              tab === "quality" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <ShieldCheck size={13} />
            Quality
            <span
              className={`rounded px-1 text-[10px] font-semibold tabular-nums ${
                report.score >= 75
                  ? "bg-success/10 text-success"
                  : report.score >= 50
                    ? "bg-warning/10 text-warning"
                    : "bg-danger/10 text-danger"
              }`}
            >
              {report.score}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          title="Close preview"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink xl:hidden"
        >
          <PanelRightClose size={16} />
        </button>
        <span className="hidden items-center gap-1.5 text-[11px] text-muted xl:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live
        </span>
      </div>
      {tab === "preview" ? <LivePreview markdown={markdown} /> : <QualityChecker markdown={markdown} />}
    </div>
  );
}
