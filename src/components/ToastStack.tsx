import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ToastMessage } from "../types";

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.variant];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-lift"
          >
            <Icon
              size={17}
              className={`mt-0.5 shrink-0 ${
                toast.variant === "success"
                  ? "text-success"
                  : toast.variant === "error"
                    ? "text-danger"
                    : "text-accent"
              }`}
            />
            <p className="flex-1 text-[13px] leading-relaxed text-ink">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
