import {
  Bold,
  Braces,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table,
} from "lucide-react";
import type { FormatAction } from "../types";

interface ToolbarAction {
  id: string;
  label: string;
  icon: typeof Bold;
  action: FormatAction;
}

const groups: ToolbarAction[][] = [
  [
    {
      id: "h1",
      label: "Heading 1",
      icon: Heading1,
      action: { type: "linePrefix", prefix: "# ", toggleHeading: true },
    },
    {
      id: "h2",
      label: "Heading 2",
      icon: Heading2,
      action: { type: "linePrefix", prefix: "## ", toggleHeading: true },
    },
    {
      id: "h3",
      label: "Heading 3",
      icon: Heading3,
      action: { type: "linePrefix", prefix: "### ", toggleHeading: true },
    },
  ],
  [
    {
      id: "bold",
      label: "Bold",
      icon: Bold,
      action: { type: "wrap", before: "**", after: "**", placeholder: "bold text" },
    },
    {
      id: "italic",
      label: "Italic",
      icon: Italic,
      action: { type: "wrap", before: "*", after: "*", placeholder: "italic text" },
    },
    {
      id: "inline-code",
      label: "Inline code",
      icon: Code,
      action: { type: "wrap", before: "`", after: "`", placeholder: "code" },
    },
    {
      id: "code-block",
      label: "Code block",
      icon: Braces,
      action: {
        type: "insert",
        text: "```\n// Your code here\n```",
        block: true,
      },
    },
  ],
  [
    {
      id: "bullet-list",
      label: "Bullet list",
      icon: List,
      action: { type: "linePrefix", prefix: "- " },
    },
    {
      id: "numbered-list",
      label: "Numbered list",
      icon: ListOrdered,
      action: { type: "linePrefix", prefix: "1. ", ordered: true },
    },
    {
      id: "quote",
      label: "Blockquote",
      icon: Quote,
      action: { type: "linePrefix", prefix: "> " },
    },
  ],
  [
    {
      id: "link",
      label: "Link",
      icon: Link,
      action: { type: "link" },
    },
    {
      id: "image",
      label: "Image",
      icon: Image,
      action: { type: "image" },
    },
    {
      id: "table",
      label: "Table",
      icon: Table,
      action: {
        type: "insert",
        text: "| Column 1 | Column 2 |\n| --- | --- |\n| Row 1 | Row 2 |",
        block: true,
      },
    },
    {
      id: "divider",
      label: "Horizontal rule",
      icon: Minus,
      action: { type: "insert", text: "---", block: true },
    },
  ],
];

interface MarkdownToolbarProps {
  onAction: (action: FormatAction) => void;
}

export function MarkdownToolbar({ onAction }: MarkdownToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Markdown formatting"
      className="toolbar-scroll flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-white px-3 py-1.5"
    >
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-0.5">
          {groupIndex > 0 && <span className="mx-1.5 h-4 w-px shrink-0 bg-line" />}
          {group.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onAction(item.action)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#515154] transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 active:bg-[#EBEBF0]"
              >
                <Icon size={16} strokeWidth={1.8} />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
