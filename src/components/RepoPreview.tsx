import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  CircleDot,
  Code2,
  Eye,
  FileText,
  GitBranch,
  GitFork,
  Github,
  GitPullRequest,
  LayoutGrid,
  Link2,
  Loader2,
  Play,
  Scale,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import {
  fetchGitHubRepository,
  formatCompactNumber,
  parseGitHubRepoInput,
  type GitHubRepository,
} from "../lib/github";
import { MarkdownBody } from "./MarkdownBody";

interface RepoPreviewProps {
  markdown: string;
  documentName: string;
  repository: string | null;
  onRepositoryChange: (repository: string | null) => void;
}

type FetchStatus = "idle" | "loading" | "ready" | "error";

const repoTabs: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Code", icon: Code2, active: true },
  { label: "Issues", icon: CircleDot },
  { label: "Pull requests", icon: GitPullRequest },
  { label: "Actions", icon: Play },
  { label: "Projects", icon: LayoutGrid },
  { label: "Wiki", icon: BookOpen },
  { label: "Security", icon: ShieldCheck },
  { label: "Insights", icon: Activity },
];

function toRepoSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "your-project"
  );
}

function describeMarkdown(markdown: string): string {
  const blocks = markdown.split(/\n{2,}/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || /^(#|!\[|<|```|\||[-*+]\s|\d+\.\s|>)/.test(trimmed)) continue;

    const clean = trimmed
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[*_`>#|]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (clean.length >= 30) {
      return clean.length > 220 ? `${clean.slice(0, 217).trimEnd()}…` : clean;
    }
  }

  return "No description provided.";
}

function detectLicense(markdown: string): string | null {
  const match = markdown.match(
    /\b(MIT|Apache(?:-2\.0|\s+2\.0)?|GPL(?:-3\.0|-2\.0|v3|v2)?|BSD(?:-3-Clause|-2-Clause)?|MPL-2\.0|ISC|Unlicense)\b/i,
  );
  return match ? match[1] : null;
}

export function RepoPreview({
  markdown,
  documentName,
  repository,
  onRepositoryChange,
}: RepoPreviewProps) {
  const parsed = useMemo(
    () => (repository ? parseGitHubRepoInput(repository) : null),
    [repository],
  );
  const [draft, setDraft] = useState(repository ?? "");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [liveRepo, setLiveRepo] = useState<GitHubRepository | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(repository ?? "");
    setLinkError(null);
  }, [repository]);

  useEffect(() => {
    if (!parsed) {
      setLiveRepo(null);
      setFetchStatus("idle");
      setFetchError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setLiveRepo(null);
    setFetchStatus("loading");
    setFetchError(null);

    fetchGitHubRepository(`${parsed.owner}/${parsed.repo}`, controller.signal)
      .then((value) => {
        if (!active) return;
        setLiveRepo(value);
        setFetchStatus("ready");
      })
      .catch((cause) => {
        if (!active) return;
        setFetchStatus("error");
        setFetchError(
          cause instanceof Error && cause.message
            ? cause.message
            : "Could not load that repository.",
        );
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [parsed]);

  const owner = parsed?.owner ?? "your-name";
  const repoName = parsed?.repo ?? toRepoSlug(documentName);
  const htmlUrl =
    liveRepo?.htmlUrl ??
    (parsed ? `https://github.com/${parsed.owner}/${parsed.repo}` : null);
  const description = liveRepo?.description ?? describeMarkdown(markdown);
  const license = liveRepo?.license ?? detectLicense(markdown);
  const topics = liveRepo?.topics ?? [];
  const branch = liveRepo?.defaultBranch ?? "main";
  const isLive = fetchStatus === "ready" && liveRepo !== null;

  const submitRepository = () => {
    const value = draft.trim();
    if (!value) {
      onRepositoryChange(null);
      setLinkError(null);
      return;
    }

    const next = parseGitHubRepoInput(value);
    if (!next) {
      setLinkError("Use owner/repo or a full GitHub URL.");
      return;
    }

    const normalized = `${next.owner}/${next.repo}`;
    setDraft(normalized);
    setLinkError(null);
    onRepositoryChange(normalized);
  };

  return (
    <div className="preview-scroll">
      <div className="mx-auto w-full max-w-[760px] px-4 py-4">
        <form
          className="rounded-xl border border-line bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.025)]"
          onSubmit={(event) => {
            event.preventDefault();
            submitRepository();
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
              <Github size={12} />
              Repository
            </span>
            <input
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (linkError) setLinkError(null);
              }}
              placeholder="owner/repo"
              spellCheck={false}
              aria-label="Linked GitHub repository"
              className="h-7 min-w-[140px] flex-1 rounded-md border border-line bg-white px-2 text-[11.5px] text-ink outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/15"
            />
            <button
              type="submit"
              className="inline-flex h-7 items-center gap-1 rounded-md bg-accent px-2.5 text-[11px] font-medium text-white transition-colors hover:bg-[#2C6EE4]"
            >
              <Link2 size={12} />
              {parsed ? "Update" : "Link"}
            </button>
            {parsed && (
              <button
                type="button"
                onClick={() => {
                  onRepositoryChange(null);
                  setDraft("");
                }}
                aria-label="Unlink repository"
                title="Unlink repository"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                <X size={13} />
              </button>
            )}
          </div>
          {linkError && (
            <p className="mt-1.5 flex items-center gap-1 text-[10.5px] text-danger">
              <AlertCircle size={11} />
              {linkError}
            </p>
          )}
          {fetchError && (
            <p className="mt-1.5 flex items-start gap-1 text-[10.5px] leading-relaxed text-danger">
              <AlertCircle size={11} className="mt-0.5 shrink-0" />
              {fetchError}
            </p>
          )}
        </form>

        <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white shadow-card">
          <div className="bg-[#FCFCFD] px-4 pt-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <BookMarked size={16} className="mt-0.5 shrink-0 text-muted" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1 text-[13px] font-semibold text-ink">
                    <span className={parsed ? "text-accent" : "text-[#515154]"}>{owner}</span>
                    <span className="text-muted">/</span>
                    <span className="truncate">{repoName}</span>
                    <span className="rounded-full border border-line bg-white px-1.5 py-0.5 text-[9px] font-medium text-muted">
                      Public
                    </span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-muted">
                    {fetchStatus === "loading" ? (
                      <>
                        <Loader2 size={11} className="animate-spin" />
                        Loading live details…
                      </>
                    ) : isLive ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        Live repository details
                      </>
                    ) : (
                      "Link a public repository to load live details."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <RepoCounter
                  icon={Eye}
                  label="Watch"
                  count={isLive ? liveRepo?.watchers : null}
                />
                <RepoCounter
                  icon={GitFork}
                  label="Fork"
                  count={isLive ? liveRepo?.forks : null}
                />
                <RepoCounter icon={Star} label="Star" count={isLive ? liveRepo?.stars : null} />
              </div>
            </div>
          </div>

          <div
            aria-label="Repository page preview"
            className="mt-3 flex gap-4 overflow-x-auto border-y border-line bg-white px-4"
          >
            {repoTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <span
                  key={tab.label}
                  className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 py-2 text-[11px] font-medium ${
                    tab.active ? "border-[#FD8C73] text-ink" : "border-transparent text-[#515154]"
                  }`}
                >
                  <Icon size={12} className="text-muted" />
                  {tab.label}
                  {tab.label === "Issues" && isLive && liveRepo && liveRepo.openIssues > 0 && (
                    <span className="rounded-full bg-canvas px-1.5 text-[9px] tabular-nums text-muted">
                      {formatCompactNumber(liveRepo.openIssues)}
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F6F8FA] px-4 py-2 text-[10.5px] text-muted">
            <div className="flex items-center gap-2">
              <GitBranch size={12} />
              <span className="rounded border border-line bg-white px-1.5 py-0.5 font-medium text-[#515154]">
                {branch}
              </span>
              <span className="hidden sm:inline">1 branch</span>
            </div>
            <span className="flex items-center gap-1">
              <FileText size={11} />
              README.md
            </span>
          </div>

          <div className="border-b border-line px-4 py-2.5">
            <div className="flex items-center gap-2 text-[11.5px] font-medium text-ink">
              <FileText size={13} className="text-muted" />
              README.md
              <span className="ml-auto text-[9.5px] font-normal uppercase tracking-[0.08em] text-muted">
                Preview
              </span>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-5">
            <MarkdownBody markdown={markdown} />
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.025)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[12px] font-semibold text-ink">About</h3>
            {htmlUrl && (
              <a
                href={htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10.5px] font-medium text-accent hover:underline"
              >
                View on GitHub
                <ArrowUpRight size={11} />
              </a>
            )}
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#515154]">{description}</p>

          {topics.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[10.5px] text-muted">
            {license && (
              <span className="flex items-center gap-1">
                <Scale size={11} />
                {license} license
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star size={11} />
              {isLive && liveRepo ? `${formatCompactNumber(liveRepo.stars)} stars` : "Stars"}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={11} />
              {isLive && liveRepo ? `${formatCompactNumber(liveRepo.forks)} forks` : "Forks"}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {isLive && liveRepo
                ? `${formatCompactNumber(liveRepo.watchers)} watching`
                : "Watchers"}
            </span>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">
          This is a page preview. Link a public repository to load its real name, description,
          topics, license and counters from the GitHub API.
        </p>
      </div>
    </div>
  );
}

function RepoCounter({
  icon: Icon,
  label,
  count,
}: {
  icon: LucideIcon;
  label: string;
  count?: number | null;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-md border border-line bg-white px-1.5 text-[10px] font-medium text-[#515154] shadow-sm">
      <Icon size={11} />
      <span className="hidden sm:inline">{label}</span>
      {count != null && <span className="tabular-nums">{formatCompactNumber(count)}</span>}
    </span>
  );
}
