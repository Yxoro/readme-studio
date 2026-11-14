import { Eye, HardDrive, PenLine, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "./Logo";

interface WelcomeScreenProps {
  onNewDocument: () => void;
  onOpenTemplates: () => void;
}

const features = [
  {
    icon: PenLine,
    title: "Write your way",
    description: "Move between a visual block editor and raw Markdown at any moment.",
  },
  {
    icon: Eye,
    title: "See it instantly",
    description: "A GitHub-style preview updates as you write, with syntax highlighting.",
  },
  {
    icon: ShieldCheck,
    title: "Ship with confidence",
    description: "A live quality score checks the essentials before you publish.",
  },
];

export function WelcomeScreen({ onNewDocument, onOpenTemplates }: WelcomeScreenProps) {
  return (
    <div className="view-scroll bg-canvas">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-12 text-center sm:px-8 lg:py-16">
        <div className="flex w-full justify-center">
          <Logo className="w-full max-w-[440px]" />
        </div>

        <h1 className="mt-8 max-w-2xl text-[30px] font-semibold leading-[1.15] tracking-[-0.04em] text-ink sm:text-[36px]">
          A better way to build your README.
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          Draft, structure and polish project documentation in one focused workspace.
          Everything stays on your device.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onNewDocument}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-[13.5px] font-medium text-white shadow-sm transition-colors hover:bg-[#2C6EE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
          >
            <Plus size={16} />
            New README
          </button>
          <button
            type="button"
            onClick={onOpenTemplates}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[13.5px] font-medium text-ink shadow-sm transition-colors hover:bg-[#FCFCFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          >
            <Sparkles size={15} className="text-muted" />
            Browse templates
          </button>
        </div>

        <div className="mt-12 grid w-full gap-3 text-left sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.025)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-[#515154]">
                  <Icon size={16} strokeWidth={1.7} />
                </span>
                <h2 className="mt-3 text-[13px] font-semibold text-ink">{feature.title}</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <HardDrive size={12} />
          100% local. No account, no backend, no tracking.
        </p>
      </div>
    </div>
  );
}
