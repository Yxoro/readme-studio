import type { FormatAction, FormatResult, MarkdownBlock } from "../types";

export function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?/g, " "))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length === 0 ? 0 : text.split(" ").length;
}

export function getReadingTime(wordCount: number): number {
  return wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 200));
}

export function getExcerpt(markdown: string, maxLength = 150): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>|]/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "Empty document";
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

function wrapSelection(
  text: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): FormatResult {
  const selected = text.slice(start, end);
  const content = selected || placeholder;
  const next = text.slice(0, start) + before + content + after + text.slice(end);

  if (selected) {
    return {
      text: next,
      selectionStart: start + before.length,
      selectionEnd: start + before.length + content.length,
    };
  }

  return {
    text: next,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + content.length,
  };
}

function prefixLines(
  text: string,
  start: number,
  end: number,
  prefix: string,
  options: { ordered?: boolean; toggleHeading?: boolean } = {},
): FormatResult {
  const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const newlineIndex = text.indexOf("\n", end);
  const lineEnd = newlineIndex === -1 ? text.length : newlineIndex;
  const block = text.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  let counter = 0;

  const nextLines = lines.map((line) => {
    if (line.trim().length === 0) return line;
    let clean = line;
    if (options.toggleHeading) {
      clean = clean.replace(/^#{1,6}\s+/, "");
    }
    if (options.ordered) {
      counter += 1;
      return `${counter}. ${clean}`;
    }
    return `${prefix}${clean}`;
  });

  const nextBlock = nextLines.join("\n");
  const next = text.slice(0, lineStart) + nextBlock + text.slice(lineEnd);

  return {
    text: next,
    selectionStart: lineStart,
    selectionEnd: lineStart + nextBlock.length,
  };
}

export function insertBlock(
  text: string,
  start: number,
  end: number,
  snippet: string,
): FormatResult {
  const trimmed = snippet.replace(/^\n+|\n+$/g, "");
  let prefix = "";
  let suffix = "";

  if (start > 0) {
    const beforeText = text.slice(0, start);
    if (!beforeText.endsWith("\n\n")) {
      prefix = beforeText.endsWith("\n") ? "\n" : "\n\n";
    }
  }

  if (end < text.length) {
    const afterText = text.slice(end);
    if (!afterText.startsWith("\n\n")) {
      suffix = afterText.startsWith("\n") ? "\n" : "\n\n";
    }
  }

  const next = text.slice(0, start) + prefix + trimmed + suffix + text.slice(end);
  const cursor = start + prefix.length + trimmed.length;

  return { text: next, selectionStart: cursor, selectionEnd: cursor };
}

export function applyFormat(
  text: string,
  start: number,
  end: number,
  action: FormatAction,
): FormatResult {
  switch (action.type) {
    case "wrap":
      return wrapSelection(text, start, end, action.before, action.after, action.placeholder);
    case "linePrefix":
      return prefixLines(text, start, end, action.prefix, {
        ordered: action.ordered,
        toggleHeading: action.toggleHeading,
      });
    case "insert":
      return action.block
        ? insertBlock(text, start, end, action.text)
        : wrapSelection(text, start, end, action.text, "", "");
    case "link": {
      const selected = text.slice(start, end);
      if (selected) {
        const before = "[";
        const after = "](https://example.com)";
        const next = text.slice(0, start) + before + selected + after + text.slice(end);
        const urlStart = start + before.length + selected.length + 2;
        return {
          text: next,
          selectionStart: urlStart,
          selectionEnd: urlStart + "https://example.com".length,
        };
      }
      const before = "[";
      const content = "link text";
      const after = "](https://example.com)";
      return {
        text: text.slice(0, start) + before + content + after + text.slice(end),
        selectionStart: start + before.length,
        selectionEnd: start + before.length + content.length,
      };
    }
    case "image": {
      const selected = text.slice(start, end);
      const before = "![";
      const alt = selected || "Alt text";
      const after = "](https://example.com/image.png)";
      const next = text.slice(0, start) + before + alt + after + text.slice(end);
      if (selected) {
        const urlStart = start + before.length + alt.length + 2;
        return {
          text: next,
          selectionStart: urlStart,
          selectionEnd: urlStart + "https://example.com/image.png".length,
        };
      }
      return {
        text: next,
        selectionStart: start + before.length,
        selectionEnd: start + before.length + alt.length,
      };
    }
    default:
      return { text, selectionStart: start, selectionEnd: end };
  }
}

function isBlockStart(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^#{1,6}\s/.test(trimmed) ||
    /^```/.test(trimmed) ||
    /^~~~/.test(trimmed) ||
    /^\s*([-*+]|\d+\.)\s/.test(line) ||
    /^\s*>/.test(line) ||
    /^\s*\|/.test(line) ||
    /^\s*(---|\*\*\*|___)\s*$/.test(line)
  );
}

function getBlockType(line: string): string {
  const trimmed = line.trim();
  if (/^#{1,6}\s/.test(trimmed)) return "Heading";
  if (/^```/.test(trimmed) || /^~~~/.test(trimmed)) return "Code";
  if (/^\s*\|/.test(line)) return "Table";
  if (/^\s*([-*+]|\d+\.)\s/.test(line)) return "List";
  if (/^\s*>/.test(line)) return "Quote";
  if (/^\s*(---|\*\*\*|___)\s*$/.test(trimmed)) return "Divider";
  return "Paragraph";
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  if (!markdown.trim()) return [];

  const lines = markdown.split("\n");
  const lineStarts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineStarts.push(offset);
    offset += line.length + 1;
  }

  const blocks: MarkdownBlock[] = [];
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    if (lines[i].trim() === "") {
      i += 1;
      continue;
    }

    const startLine = i;
    const first = lines[i];

    if (/^\s*(```|~~~)/.test(first)) {
      const fence = first.trim().slice(0, 3);
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) i += 1;
      if (i < lines.length) i += 1;
    } else if (/^#{1,6}\s/.test(first.trim()) || /^\s*(---|\*\*\*|___)\s*$/.test(first.trim())) {
      i += 1;
    } else if (/^\s*\|/.test(first)) {
      i += 1;
      while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) i += 1;
    } else if (/^\s*([-*+]|\d+\.)\s/.test(first)) {
      i += 1;
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        (/^\s*([-*+]|\d+\.)\s/.test(lines[i]) ||
          /^\s{2,}/.test(lines[i]) ||
          lines[i].trim() === "") 
      ) {
        i += 1;
      }
    } else if (/^\s*>/.test(first)) {
      i += 1;
      while (i < lines.length && lines[i].trim() !== "" && /^\s*>/.test(lines[i])) i += 1;
    } else {
      i += 1;
      while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) i += 1;
    }

    const raw = lines.slice(startLine, i).join("\n");
    const start = lineStarts[startLine];
    const end = start + raw.length;
    blocks.push({
      id: `${blockIndex}-${start}`,
      type: getBlockType(first),
      raw,
      start,
      end,
    });
    blockIndex += 1;
  }

  return blocks;
}

const TOC_HEADING = "Table of Contents";

interface TocHeading {
  level: number;
  text: string;
  slug: string;
}

function stripHeadingMarkup(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+#+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(text: string, seen: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

function collectHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const seen = new Map<string, number>();
  let fence: string | null = null;

  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);
    if (fenceMatch) {
      if (!fence) {
        fence = fenceMatch[1];
      } else if (trimmed.startsWith(fence)) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;

    const text = stripHeadingMarkup(heading[2]);
    if (!text) continue;
    headings.push({
      level: heading[1].length,
      text,
      slug: slugifyHeading(text, seen),
    });
  }

  return headings;
}

export function generateTableOfContents(markdown: string): string | null {
  const headings = collectHeadings(markdown).filter(
    (heading) =>
      heading.level > 1 && heading.text.toLowerCase() !== TOC_HEADING.toLowerCase(),
  );
  if (headings.length < 2) return null;

  const minLevel = Math.min(...headings.map((heading) => heading.level));
  const lines = headings.map((heading) => {
    const indent = "  ".repeat(Math.max(0, heading.level - minLevel));
    const label = heading.text.replace(/([\[\]])/g, "\\$1");
    return `${indent}- [${label}](#${heading.slug})`;
  });

  return `## ${TOC_HEADING}\n\n${lines.join("\n")}`;
}

function stripExistingTableOfContents(markdown: string): string {
  const lines = markdown.split("\n");
  let fence: string | null = null;
  let tocStart = -1;
  let tocLevel = 0;
  let tocEnd = lines.length;

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);
    if (fenceMatch) {
      if (!fence) {
        fence = fenceMatch[1];
      } else if (trimmed.startsWith(fence)) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    const heading = lines[index].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;
    const level = heading[1].length;

    if (tocStart === -1) {
      if (stripHeadingMarkup(heading[2]).toLowerCase() === TOC_HEADING.toLowerCase()) {
        tocStart = index;
        tocLevel = level;
      }
    } else if (level <= tocLevel) {
      tocEnd = index;
      break;
    }
  }

  if (tocStart === -1) return markdown;

  const before = lines.slice(0, tocStart);
  const after = lines.slice(tocEnd);
  while (before.length > 0 && before[before.length - 1].trim() === "") before.pop();
  while (after.length > 0 && after[0].trim() === "") after.shift();
  return [...before, ...after].join("\n");
}

export function insertTableOfContents(markdown: string): string | null {
  const withoutExisting = stripExistingTableOfContents(markdown);
  const table = generateTableOfContents(withoutExisting);
  if (!table) return null;

  const lines = withoutExisting.split("\n");
  let fence: string | null = null;
  let insertAt = lines.length;

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);
    if (fenceMatch) {
      if (!fence) {
        fence = fenceMatch[1];
      } else if (trimmed.startsWith(fence)) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    const heading = lines[index].match(/^(#{1,6})\s+/);
    if (heading && heading[1].length >= 2) {
      insertAt = index;
      break;
    }
  }

  if (insertAt === lines.length) {
    const trimmed = withoutExisting.replace(/\s+$/, "");
    return trimmed ? `${trimmed}\n\n${table}\n` : `${table}\n`;
  }

  const before = lines.slice(0, insertAt).join("\n").replace(/\s+$/, "");
  const after = lines.slice(insertAt).join("\n").replace(/^\s+/, "");
  const prefix = before ? `${before}\n\n` : "";
  return `${prefix}${table}\n\n${after}`;
}
