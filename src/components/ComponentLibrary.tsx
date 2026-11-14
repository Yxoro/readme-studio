import { Plus } from "lucide-react";
import type { ComponentSection } from "../types";
import { componentSections } from "../lib/componentsLibrary";
import { Modal } from "./Modal";

interface ComponentLibraryProps {
  open: boolean;
  onClose: () => void;
  onInsert: (section: ComponentSection) => void;
}

export function ComponentLibrary({ open, onClose, onInsert }: ComponentLibraryProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Components"
      description="Click a section to insert it at your cursor. Click Done in the editor before adding inline formatting."
      eyebrow="Library"
      placement="right"
      footer={
        <p className="text-[11px] leading-relaxed text-muted">
          Sections insert as clean Markdown and can be undone with Ctrl / ⌘ + Z.
        </p>
      }
    >
      <div className="space-y-1.5 p-3.5">
        {componentSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onInsert(section)}
              className="group flex w-full items-start gap-3.5 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:border-line hover:bg-[#FCFCFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-[#515154] transition-colors group-hover:text-accent">
                <Icon size={16} strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-ink">{section.name}</span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">
                  {section.description}
                </span>
              </span>
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas text-muted transition-colors group-hover:bg-accent group-hover:text-white">
                <Plus size={13} strokeWidth={2.2} />
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
