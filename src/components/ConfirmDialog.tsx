import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import type { ConfirmOptions } from "../types";

interface ConfirmDialogProps {
  options: ConfirmOptions | null;
  onClose: () => void;
}

export function ConfirmDialog({ options, onClose }: ConfirmDialogProps) {
  return (
    <Modal
      open={Boolean(options)}
      onClose={onClose}
      title={options?.title ?? ""}
      size="sm"
    >
      {options && (
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3.5">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                options.destructive
                  ? "bg-danger/10 text-danger"
                  : "bg-accent/10 text-accent"
              }`}
            >
              <AlertTriangle size={17} />
            </span>
            <p className="pt-1.5 text-[13px] leading-relaxed text-[#515154]">
              {options.description}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              autoFocus
              onClick={onClose}
              className="h-9 rounded-lg border border-line bg-white px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
            >
              {options.cancelLabel ?? "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => {
                options.onConfirm();
                onClose();
              }}
              className={`h-9 rounded-lg px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 ${
                options.destructive ? "bg-danger" : "bg-accent"
              }`}
            >
              {options.confirmLabel}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
