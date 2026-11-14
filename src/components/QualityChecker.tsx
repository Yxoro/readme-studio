import { useMemo } from "react";
import {
  AlertCircle,
  AlignLeft,
  CheckCircle2,
  ImageOff,
  Link2Off,
  ShieldCheck,
} from "lucide-react";
import { analyzeReadme } from "../lib/qualityChecker";

interface QualityCheckerProps {
  markdown: string;
}

const gradeCopy: Record<
  ReturnType<typeof analyzeReadme>["grade"],
  { title: string; description: string }
> = {
  excellent: {
    title: "Ready to publish",
    description: "Your README covers the essentials and is in great shape.",
  },
  good: {
    title: "Almost there",
    description: "A few small additions will make this README complete.",
  },
  fair: {
    title: "Good start",
    description: "The structure is taking shape. Fill in the missing essentials.",
  },
  "needs-work": {
    title: "Needs a little work",
    description: "Start with a title and description, then add the core sections.",
  },
};

function scoreColor(score: number): string {
  if (score >= 75) return "#248A3D";
  if (score >= 50) return "#B25000";
  return "#D70015";
}

function checkIcon(id: string) {
  if (id === "image-alt") return ImageOff;
  if (id === "links") return Link2Off;
  if (id === "empty-sections") return AlignLeft;
  return ShieldCheck;
}

export function QualityChecker({ markdown }: QualityCheckerProps) {
  const report = useMemo(() => analyzeReadme(markdown), [markdown]);
  const color = scoreColor(report.score);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (report.score / 100) * circumference;
  const copy = gradeCopy[report.grade];

  return (
    <div className="preview-scroll">
      <div className="mx-auto w-full max-w-[600px] px-6 py-7">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex items-center gap-5">
            <div className="relative h-[88px] w-[88px] shrink-0">
              <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="none"
                  stroke="#EDEDF0"
                  strokeWidth="7"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-semibold leading-none tracking-tight text-ink">
                  {report.score}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                  of 100
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-tight text-ink">{copy.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{copy.description}</p>
              <p className="mt-2 text-[11px] text-muted">
                Analyzed live across 8 README checks.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-7" aria-labelledby="quality-checks-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="quality-checks-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted"
            >
              Checks
            </h2>
            <span className="text-[11px] text-muted">
              {report.checks.filter((check) => check.passed).length}/{report.checks.length} passed
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            {report.checks.map((check, index) => {
              const Icon = checkIcon(check.id);
              return (
                <div
                  key={check.id}
                  className={`flex items-start gap-3 px-4 py-3.5 ${
                    index > 0 ? "border-t border-line/80" : ""
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      check.passed
                        ? "bg-success/10 text-success"
                        : "bg-[#D70015]/10 text-danger"
                    }`}
                  >
                    {check.passed ? (
                      <CheckCircle2 size={14} strokeWidth={2.1} />
                    ) : (
                      <AlertCircle size={14} strokeWidth={2.1} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-ink">{check.label}</span>
                      <Icon size={13} className="shrink-0 text-muted" />
                    </div>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{check.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-7" aria-labelledby="recommendations-heading">
          <h2
            id="recommendations-heading"
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted"
          >
            Recommendations
          </h2>
          {report.recommendations.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/[0.045] px-4 py-3.5">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
              <p className="text-[13px] leading-relaxed text-ink">
                No recommendations. Your README covers all of the essentials.
              </p>
            </div>
          ) : (
            <ol className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <li
                  key={recommendation}
                  className="flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3"
                >
                  <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-semibold text-muted">
                    {index + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed text-ink">{recommendation}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <p className="mt-7 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
          The score combines five core sections worth 100 points, with deductions for missing
          image alt text, malformed links and empty sections.
        </p>
      </div>
    </div>
  );
}
