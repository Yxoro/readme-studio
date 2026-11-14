import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CircleDot,
  Eye,
  GitFork,
  GitPullRequest,
  Github,
  HardDrive,
  LayoutTemplate,
  ListTree,
  PenLine,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import {
  CONTRIBUTING_URL,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_URL,
  GOOD_FIRST_ISSUES_URL,
  ISSUES_URL,
  fetchGitHubRepoStats,
  formatCompactNumber,
  type GitHubRepoStats,
} from "../lib/github";
import { Logo } from "./Logo";

interface HomeViewProps {
  onNewDocument: () => void;
  onOpenTemplates: () => void;
  onOpenGitHubImport: () => void;
}

type StatsStatus = "loading" | "ready" | "error";

const features: { icon: LucideIcon; title: string; description: string }[] = [
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
  {
    icon: ListTree,
    title: "Keep readers oriented",
    description: "Generate a linked table of contents from your headings in one click.",
  },
  {
    icon: Github,
    title: "Start from GitHub",
    description: "Import the README of any public repository as a new local document.",
  },
  {
    icon: Sparkles,
    title: "Ask for a better draft",
    description: "Use your own AI key to rewrite, tighten and extend the document.",
  },
];

const contributionLinks: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    icon: BookOpen,
    title: "Contributing guide",
    description: "Setup, conventions and the review checklist.",
    href: CONTRIBUTING_URL,
  },
  {
    icon: GitPullRequest,
    title: "Good first issues",
    description: "Small, well-scoped places to start.",
    href: GOOD_FIRST_ISSUES_URL,
  },
  {
    icon: CircleDot,
    title: "Open an issue",
    description: "Report a bug or describe an outcome.",
    href: ISSUES_URL,
  },
];

export function HomeView({ onNewDocument, onOpenTemplates, onOpenGitHubImport }: HomeViewProps) {
  const [stats, setStats] = useState<GitHubRepoStats | null>(null);
  const [statsStatus, setStatsStatus] = useState<StatsStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setStatsStatus("loading");
    fetchGitHubRepoStats(controller.signal)
      .then((value) => {
        if (!active) return;
        setStats(value);
        setStatsStatus("ready");
      })
      .catch(() => {
        if (active) setStatsStatus("error");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const stars = statsStatus === "ready" && stats ? formatCompactNumber(stats.stars) : "—";
  const forks = statsStatus === "ready" && stats ? formatCompactNumber(stats.forks) : "—";
  const openIssues =
    statsStatus === "ready" && stats ? formatCompactNumber(stats.openIssues) : "—";
  const contributors =
    statsStatus === "ready" && stats?.contributors != null
      ? formatCompactNumber(stats.contributors)
      : "—";

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
            <LayoutTemplate size={15} className="text-muted" />
            Browse templates
          </button>
          <button
            type="button"
            onClick={onOpenGitHubImport}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[13.5px] font-medium text-ink shadow-sm transition-colors hover:bg-[#FCFCFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          >
            <Github size={15} className="text-muted" />
            Import from GitHub
          </button>
        </div>

        <section
          aria-labelledby="github-heading"
          className="mt-10 w-full rounded-2xl border border-line bg-white p-5 text-left shadow-card sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas text-ink">
                <Github size={19} strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <h2
                  id="github-heading"
                  className="text-[14px] font-semibold tracking-tight text-ink"
                >
                  {GITHUB_OWNER}/{GITHUB_REPO}
                </h2>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                  Open source, local-first and built in the open.
                </p>
              </div>
            </div>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-medium text-ink shadow-sm transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
            >
              <Star size={13} />
              Star on GitHub
              <ArrowUpRight size={12} className="text-muted" />
            </a>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={Star} label="Stars" value={stars} />
            <Stat icon={GitFork} label="Forks" value={forks} />
            <Stat icon={CircleDot} label="Open issues" value={openIssues} />
            <Stat icon={Users} label="Contributors" value={contributors} />
          </dl>

          {statsStatus === "error" && (
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              Live GitHub stats could not be loaded. The repository links still work.
            </p>
          )}
        </section>

        <section
          aria-labelledby="contributing-heading"
          className="mt-4 w-full rounded-2xl border border-line bg-white p-5 text-left shadow-card sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <GitPullRequest size={15} />
            </span>
            <div>
              <h2
                id="contributing-heading"
                className="text-[14px] font-semibold tracking-tight text-ink"
              >
                Contributing
              </h2>
              <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted">
                README Studio is co-authored in the open. A typo fix, a clearer sentence, an
                accessibility improvement or a new template all count. You do not need to be a
                maintainer to shape it.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {contributionLinks.map((link) => (
              <ContributionLink key={link.href} {...link} />
            ))}
          </div>
        </section>

        <div className="mt-10 w-full text-left">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={13} className="text-accent" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
              What&apos;s inside
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  <h3 className="mt-3 text-[13px] font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <HardDrive size={12} />
          100% local. No account, no backend, no tracking.
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-[#FCFCFD] px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
        <Icon size={11} />
        {label}
      </dt>
      <dd className="mt-1 text-[17px] font-semibold tabular-nums tracking-tight text-ink">
        {value}
      </dd>
    </div>
  );
}

function ContributionLink({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start gap-2.5 rounded-xl border border-line bg-[#FCFCFD] px-3.5 py-3 transition-colors hover:border-[#CFCFD6] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
    >
      <Icon
        size={14}
        className="mt-0.5 shrink-0 text-muted transition-colors group-hover:text-accent"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-[12px] font-medium text-ink">
          {title}
          <ArrowUpRight size={11} className="text-muted" />
        </span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
          {description}
        </span>
      </span>
    </a>
  );
}
