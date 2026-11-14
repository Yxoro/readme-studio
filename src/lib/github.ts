export const GITHUB_OWNER = "Yxoro";
export const GITHUB_REPO = "readme-studio";
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const CONTRIBUTING_URL = `${GITHUB_URL}/blob/main/CONTRIBUTING.md`;
export const ISSUES_URL = `${GITHUB_URL}/issues/new`;
export const GOOD_FIRST_ISSUES_URL = `${GITHUB_URL}/labels/good%20first%20issue`;

const GITHUB_API = "https://api.github.com";

function githubHeaders(accept = "application/vnd.github+json"): Record<string, string> {
  return {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  openIssues: number;
  contributors: number | null;
}

export interface GitHubRepository {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  topics: string[];
  license: string | null;
  defaultBranch: string;
  htmlUrl: string;
}

interface RepoDetailsResponse {
  full_name?: string;
  description?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  subscribers_count?: number;
  open_issues_count?: number;
  topics?: string[];
  license?: { spdx_id?: string | null } | null;
  default_branch?: string;
  html_url?: string;
}

interface RepoResponse {
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

async function fetchContributorCount(signal?: AbortSignal): Promise<number | null> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors?per_page=1&anon=1`,
      { headers: githubHeaders(), signal },
    );
    if (!response.ok) return null;

    const lastPage = response.headers.get("link")?.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (lastPage) return Number(lastPage[1]);

    const data: unknown = await response.json();
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

export async function fetchGitHubRepoStats(signal?: AbortSignal): Promise<GitHubRepoStats> {
  const response = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
    headers: githubHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error("GitHub repository stats are unavailable right now.");
  }

  const data = (await response.json()) as RepoResponse;
  const contributors = await fetchContributorCount(signal);

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  return {
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    contributors,
  };
}

export interface GitHubReadmeResult {
  content: string;
  name: string;
  repo: string;
}

export function parseGitHubRepoInput(input: string): { owner: string; repo: string } | null {
  if (!input || typeof input !== "string") return null;

  const cleaned = input
    .trim()
    .replace(/^https?:\/\/(?:www\.)?github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const [owner, repo] = parts;
  const validPart = /^[A-Za-z0-9_.-]+$/;
  if (!validPart.test(owner) || !validPart.test(repo)) return null;

  return { owner, repo };
}

export async function fetchGitHubRepository(
  repository: string,
  signal?: AbortSignal,
): Promise<GitHubRepository> {
  const parsed = parseGitHubRepoInput(repository);
  if (!parsed) {
    throw new Error("Enter a repository as owner/repo or paste a full GitHub URL.");
  }

  const response = await fetch(`${GITHUB_API}/repos/${parsed.owner}/${parsed.repo}`, {
    headers: githubHeaders(),
    signal,
  });

  if (response.status === 404) {
    throw new Error("That public repository could not be found.");
  }
  if (response.status === 403) {
    throw new Error("The GitHub API rate limit was reached. Try again in a few minutes.");
  }
  if (!response.ok) {
    throw new Error(`GitHub could not load that repository (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as RepoDetailsResponse;
  const license = data.license?.spdx_id;

  return {
    fullName: data.full_name ?? `${parsed.owner}/${parsed.repo}`,
    description: data.description?.trim() || null,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    watchers: data.subscribers_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    topics: Array.isArray(data.topics) ? data.topics.slice(0, 6) : [],
    license: license && license !== "NOASSERTION" ? license : null,
    defaultBranch: data.default_branch || "main",
    htmlUrl: data.html_url ?? `https://github.com/${parsed.owner}/${parsed.repo}`,
  };
}

export async function fetchGitHubReadme(
  input: string,
  signal?: AbortSignal,
): Promise<GitHubReadmeResult> {
  const parsed = parseGitHubRepoInput(input);
  if (!parsed) {
    throw new Error("Enter a repository as owner/repo or paste a full GitHub URL.");
  }

  const response = await fetch(
    `${GITHUB_API}/repos/${parsed.owner}/${parsed.repo}/readme`,
    {
      headers: githubHeaders("application/vnd.github.raw"),
      signal,
    },
  );

  if (response.status === 404) {
    throw new Error("No README was found in that public repository.");
  }
  if (response.status === 403) {
    throw new Error("The GitHub API rate limit was reached. Try again in a few minutes.");
  }
  if (!response.ok) {
    throw new Error(`GitHub could not load that README (HTTP ${response.status}).`);
  }

  const content = await response.text();
  if (!content.trim()) {
    throw new Error("That README is empty.");
  }
  if (content.length > 1_000_000) {
    throw new Error("That README is too large to import.");
  }

  return {
    content,
    name: `${parsed.repo} README`,
    repo: `${parsed.owner}/${parsed.repo}`,
  };
}
