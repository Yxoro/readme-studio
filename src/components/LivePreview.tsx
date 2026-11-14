import { FileText } from "lucide-react";
import { MarkdownBody } from "./MarkdownBody";

interface LivePreviewProps {
  markdown: string;
}

export function LivePreview({ markdown }: LivePreviewProps) {
  if (!markdown.trim()) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-10 py-16 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-canvas text-muted">
          <FileText size={20} strokeWidth={1.7} />
        </span>
        <h2 className="text-[15px] font-semibold text-ink">Nothing to preview yet</h2>
        <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-muted">
          Start typing in the editor to see your README rendered here, exactly as it will
          appear on GitHub.
        </p>
      </div>
    );
  }

  return (
    <div className="preview-scroll">
      <div className="preview-page">
        <MarkdownBody markdown={markdown} />
      </div>
    </div>
  );
}
