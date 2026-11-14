import { ArrowUpRight } from "lucide-react";
import type { Template } from "../types";
import { templates } from "../templates";
import { Modal } from "./Modal";

interface TemplateGalleryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export function TemplateGallery({ open, onClose, onSelect }: TemplateGalleryProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start from a template"
      description="Each template creates a new document with a complete structure you can edit. Your current work stays saved."
      eyebrow="Templates"
      size="xl"
    >
      <div className="p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                className="group flex items-start gap-4 rounded-xl border border-line bg-white p-4 text-left transition-all hover:border-[#CFCFD6] hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-[#515154] transition-colors group-hover:border-accent/15 group-hover:bg-accent/[0.06] group-hover:text-accent">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-[13.5px] font-semibold text-ink">{template.name}</span>
                    <ArrowUpRight
                      size={14}
                      className="mt-0.5 shrink-0 text-muted transition-colors group-hover:text-accent"
                    />
                  </span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-muted">
                    {template.description}
                  </span>
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-line bg-[#FCFCFD] px-1.5 py-0.5 text-[10px] font-medium text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-center text-[11px] text-muted">
          Templates are a starting point. Everything remains editable in Markdown.
        </p>
      </div>
    </Modal>
  );
}
