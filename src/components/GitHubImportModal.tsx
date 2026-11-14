import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Github, Loader2 } from "lucide-react";
import { fetchGitHubReadme } from "../lib/github";
import { Modal } from "./Modal";

interface GitHubImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (document: { name: string; content: string; repository: string }) => void;
}

const exampleRepository = "Yxoro/readme-studio";

export function GitHubImportModal({ open, onClose, onImport }: GitHubImportModalProps) {
  const [repo, setRepo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const submit = async () => {
    if (busy || !repo.trim()) return;

    setBusy(true);
    setError(null);

    try {
      const result = await fetchGitHubReadme(repo);
      if (!openRef.current) return;
      onImport({ name: result.name, content: result.content, repository: result.repo });
      setRepo("");
    } catch (cause) {
      if (!openRef.current) return;
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "Could not import that README.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import from GitHub"
      description="Fetch the README of any public repository and keep editing it locally."
      eyebrow="GitHub"
      size="sm"
    >
      <form
        className="p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label htmlFor="github-repo" className="block text-[11px] font-medium text-ink">
          Repository
        </label>
        <div className="relative mt-1.5">
          <Github
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="github-repo"
            value={repo}
            onChange={(event) => {
              setRepo(event.target.value);
              if (error) setError(null);
            }}
            placeholder="owner/repo or a GitHub URL"
            spellCheck={false}
            autoComplete="off"
            disabled={busy}
            className="h-9 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] text-ink outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/15 disabled:opacity-60"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10.5px] text-muted">Try:</span>
          <button
            type="button"
            onClick={() => {
              setRepo(exampleRepository);
              setError(null);
            }}
            className="rounded-md border border-line bg-white px-2 py-0.5 text-[10.5px] font-medium text-[#515154] transition-colors hover:bg-canvas hover:text-ink"
          >
            {exampleRepository}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/[0.035] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#B00012]"
          >
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!repo.trim() || busy}
          className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2C6EE4] disabled:cursor-not-allowed disabled:bg-[#D9D9DE]"
        >
          {busy ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Fetching README
            </>
          ) : (
            <>
              <ArrowRight size={14} />
              Import README
            </>
          )}
        </button>

        <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
          Uses the public GitHub API and works with public repositories only. Nothing is
          uploaded to a README Studio server.
        </p>
      </form>
    </Modal>
  );
}
