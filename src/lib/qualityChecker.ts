import type { QualityCheck, QualityReport } from "../types";

interface Heading {
  level: number;
  text: string;
  line: number;
}

function getHeadings(markdown: string): Heading[] {
  const lines = markdown.split("\n");
  const headings: Heading[] = [];

  lines.forEach((line, index) => {
    const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim(), line: index });
    }
  });

  return headings;
}

function hasHeading(headings: Heading[], pattern: RegExp): Heading | undefined {
  return headings.find((heading) => heading.level >= 2 && pattern.test(heading.text));
}

function findDescription(markdown: string, headings: Heading[]): string {
  const lines = markdown.split("\n");
  const title = headings.find((heading) => heading.level === 1);
  if (!title) return "";

  const nextHeadingLine =
    headings.find((heading) => heading.line > title.line)?.line ?? lines.length;
  const descriptionLines: string[] = [];

  for (let i = title.line + 1; i < nextHeadingLine; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^!\[[^\]]*\]\([^)]*\)(\s*!\[[^\]]*\]\([^)]*\))*$/.test(line)) continue;
    if (/^<[^>]+>$/.test(line)) continue;
    if (/^\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)$/.test(line)) continue;
    descriptionLines.push(line);
  }

  return descriptionLines
    .join(" ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .trim();
}

function getEmptySections(markdown: string, headings: Heading[]): Heading[] {
  const lines = markdown.split("\n");
  const empty: Heading[] = [];

  headings
    .filter((heading) => heading.level >= 2)
    .forEach((heading) => {
      const nextHeadingLine =
        headings.find(
          (candidate) => candidate.line > heading.line && candidate.level <= heading.level,
        )?.line ?? lines.length;
      const content = lines
        .slice(heading.line + 1, nextHeadingLine)
        .join("\n")
        .trim();
      if (!content) empty.push(heading);
    });

  return empty;
}

interface ImageIssue {
  alt: string;
  url: string;
}

interface LinkIssue {
  text: string;
  url: string;
  reason: string;
}

function inspectImages(markdown: string): ImageIssue[] {
  const issues: ImageIssue[] = [];
  const imagePattern = /!\[([^\]]*)\]\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = imagePattern.exec(markdown)) !== null) {
    if (match[1].trim().length === 0) {
      issues.push({ alt: match[1], url: match[2] });
    }
  }

  return issues;
}

function inspectLinks(markdown: string): LinkIssue[] {
  const issues: LinkIssue[] = [];
  const linkPattern = /(!?)\[([^\]]*)\]\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const isImage = match[1] === "!";
    const text = match[2];
    const rawUrl = match[3].trim();

    if (isImage) continue;

    let reason = "";
    if (rawUrl.length === 0) reason = "Destination is empty";
    else if (rawUrl.startsWith("<") && rawUrl.endsWith(">")) reason = "";
    else if (/\s/.test(rawUrl)) reason = "Destination contains spaces";
    else if (/^javascript:/i.test(rawUrl)) reason = "Unsafe URL scheme";
    else if (text.trim().length === 0) reason = "Link text is empty";

    if (reason) issues.push({ text, url: rawUrl, reason });
  }

  return issues;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function analyzeReadme(markdown: string): QualityReport {
  const headings = getHeadings(markdown);
  const title = headings.find((heading) => heading.level === 1);
  const description = findDescription(markdown, headings);
  const installation = hasHeading(headings, /(install|getting started|setup|quick start)/i);
  const usage = hasHeading(headings, /(usage|examples?|how to use)/i);
  const license = hasHeading(headings, /licen[cs]e/i) ??
    (/(^|\n)(licen[cs]e)\s*[:\-]/i.test(markdown) ? { text: "License" } : undefined);

  const imageIssues = inspectImages(markdown);
  const linkIssues = inspectLinks(markdown);
  const emptySections = getEmptySections(markdown, headings);

  const checks: QualityCheck[] = [
    {
      id: "title",
      label: "Project title",
      passed: Boolean(title),
      detail: title ? `H1 title found: “${title.text}”.` : "Add a single H1 heading at the top.",
      impact: title ? 30 : 0,
    },
    {
      id: "description",
      label: "Description",
      passed: description.length >= 40,
      detail:
        description.length >= 40
          ? "A description sits directly below the title."
          : "Write a short paragraph explaining what the project does.",
      impact: description.length >= 40 ? 20 : 0,
    },
    {
      id: "installation",
      label: "Installation",
      passed: Boolean(installation),
      detail: installation
        ? `Installation guidance found in “${installation.text}”.`
        : "Add an Installation or Getting Started section.",
      impact: installation ? 20 : 0,
    },
    {
      id: "usage",
      label: "Usage examples",
      passed: Boolean(usage),
      detail: usage
        ? `Usage guidance found in “${usage.text}”.`
        : "Add a Usage section with a practical example.",
      impact: usage ? 20 : 0,
    },
    {
      id: "license",
      label: "License",
      passed: Boolean(license),
      detail: license
        ? "The project includes license information."
        : "Add a License section so others know how they can use it.",
      impact: license ? 10 : 0,
    },
    {
      id: "image-alt",
      label: "Image alt text",
      passed: imageIssues.length === 0,
      detail:
        imageIssues.length === 0
          ? "Every image includes alternative text."
          : `${plural(imageIssues.length, "image")} missing alt text.`,
      impact: imageIssues.length === 0 ? 0 : -Math.min(10, imageIssues.length * 5),
    },
    {
      id: "links",
      label: "Link formatting",
      passed: linkIssues.length === 0,
      detail:
        linkIssues.length === 0
          ? "Links are correctly formatted."
          : `${plural(linkIssues.length, "malformed link")} found.`,
      impact: linkIssues.length === 0 ? 0 : -Math.min(10, linkIssues.length * 5),
    },
    {
      id: "empty-sections",
      label: "Section content",
      passed: emptySections.length === 0,
      detail:
        emptySections.length === 0
          ? "No empty sections detected."
          : `${plural(emptySections.length, "empty section")}: ${emptySections
              .map((section) => section.text)
              .slice(0, 3)
              .join(", ")}.`,
      impact: emptySections.length === 0 ? 0 : -Math.min(10, emptySections.length * 5),
    },
  ];

  const rawScore = checks.reduce((total, check) => total + check.impact, 0);
  const score = Math.max(0, Math.min(100, rawScore));

  const recommendations: string[] = [];
  if (!title) recommendations.push("Add an H1 title that names the project.");
  if (description.length < 40) {
    recommendations.push("Write a clear one or two sentence description below the title.");
  }
  if (!installation) {
    recommendations.push("Add an Installation section with exact commands or steps.");
  }
  if (!usage) recommendations.push("Add a Usage section with a small, runnable example.");
  if (!license) recommendations.push("Include a License section with the license name.");
  if (imageIssues.length > 0) {
    recommendations.push(
      `Add alt text to ${plural(imageIssues.length, "image")} so the README is accessible.`,
    );
  }
  if (linkIssues.length > 0) {
    const example = linkIssues[0];
    recommendations.push(
      `Fix ${plural(linkIssues.length, "malformed link")} (for example: “${
        example.text || example.url || "empty"
      }” — ${example.reason.toLowerCase()}).`,
    );
  }
  if (emptySections.length > 0) {
    recommendations.push(
      `Fill or remove ${plural(emptySections.length, "empty section")}: ${emptySections
        .map((section) => section.text)
        .slice(0, 3)
        .join(", ")}.`,
    );
  }

  const grade: QualityReport["grade"] =
    score >= 90 ? "excellent" : score >= 75 ? "good" : score >= 50 ? "fair" : "needs-work";

  return { score, grade, checks, recommendations };
}
