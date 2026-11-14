import { BookOpen, Keyboard, LayoutTemplate, Plus } from "lucide-react";
import { MarkdownBody } from "./MarkdownBody";

interface DocumentationViewProps {
  onNewDocument: () => void;
  onOpenTemplates: () => void;
}

const documentation = `## Getting started

README Studio is a local-first writing workspace for project documentation. There is no backend and no account: every document is stored in your browser's local storage.

1. Select **New README** in the sidebar, or start from a template.
2. Give the document a name in the top bar.
3. Write in the visual block editor or switch to raw Markdown.
4. Watch the live preview and quality score update as you work.
5. Export the result as a real \`README.md\` file.

## The editor

The editor has two modes, and they edit the same Markdown source.

**Visual Editor** renders your document as formatted blocks. Click any block to edit its Markdown inline, then press **Done**, **Esc**, or **Ctrl / ⌘ + Enter** to return to the formatted view.

**Raw Markdown** gives you a monospace source editor with the complete document in view.

Your word count, character count and estimated reading time are shown below the editor.

## Formatting toolbar

The toolbar inserts real Markdown syntax at your cursor. Select text first to wrap it, or place the cursor on a line to apply a heading, list or quote.

| Action | Syntax |
| --- | --- |
| Heading 1, 2, 3 | \`#\`, \`##\`, \`###\` |
| Bold | \`**text**\` |
| Italic | \`*text*\` |
| Inline code | \`code\` |
| Code block | Fenced code block |
| Bullet list | \`- item\` |
| Numbered list | \`1. item\` |
| Link | \`[label](url)\` |
| Image | \`![alt](url)\` |
| Table | GFM pipe table |
| Blockquote | \`> quote\` |
| Horizontal rule | \`---\` |

## Components

Open **Components** from the sidebar to insert a prepared section at your cursor. Use it for features, installation, screenshots, tech stacks, roadmaps, contribution guidelines and more. Every inserted section remains ordinary Markdown that you can edit.

## Templates

**Templates** contains seven complete starting points: open source, React, Python, Godot, API documentation, portfolio and CLI. Choosing one creates a new document; your existing documents are untouched.

## Table of contents

Open a document with at least two headings, then select **Contents** in the editor header. README Studio builds a linked table of contents from those headings and places it after the introduction. Run it again after changing a heading to refresh the existing table.

## Import from GitHub

Choose **Import from GitHub** on the home page or in My Projects, then enter a public repository as \`owner/repo\` or paste its GitHub URL. The README is fetched through the public GitHub API and becomes a new local document. Nothing is sent to a README Studio server.

## GitHub page preview

Open the preview panel and select **GitHub** to see the current README inside a repository page layout. Link a public repository with **owner/repo** to load its real description, topics, license and counters from the GitHub API. Imported READMEs link their repository automatically. The preview is read-only and never publishes anything.

## AI assistant

Open **AI** in the top bar to work with an AI editor in a panel beside the document. The assistant uses your own API key and talks directly to an OpenAI-compatible chat completions endpoint.

### Connecting a provider

Open the AI settings from the panel header and add:

- an API base URL, such as the default Z.ai endpoint
- a model name
- your API key

The key is stored only in this browser's local storage and is sent only to the endpoint you configure. README Studio never receives it. Some providers block requests made directly from a browser; use an endpoint that allows CORS. The **Test connection** button reports provider, key and CORS problems.

### Live edits

Describe the change in plain language, for example “make the installation section clearer” or “add a features table”. The AI streams the complete updated Markdown directly into the editor, so the document changes live. Use Ctrl / ⌘ + Z to undo if you do not like the result. Stop a long generation from the AI panel header.

### Promo README

The **Promo README** tab turns a raw idea into a promotional concept README without requiring a project description or existing code. It clearly labels the result as a concept, avoids invented traction or testimonials, and creates a new document when generation completes. Export it like any other README.

## Quality score

The **Quality** tab analyzes the Markdown currently in the editor. It checks for a title, description, installation guidance, usage examples and license information. It also flags images without alt text, malformed links and empty sections.

The five core sections are worth 100 points, and accessibility or formatting issues deduct points. Recommendations update live and explain what to fix.

## Import and export

Use **Import** in the top bar to load a \`.md\` file from your computer. The imported file becomes a new document.

**Export README.md** downloads the current Markdown source — never the rendered HTML. The preview is only a visual representation of the source.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl / ⌘ + S | Save immediately |
| Ctrl / ⌘ + Z | Undo |
| Ctrl / ⌘ + Shift + Z | Redo |
| Ctrl / ⌘ + Y | Redo |
| Esc | Close dialogs and finish a block |
| Ctrl / ⌘ + Enter | Finish editing a block |

## Data and privacy

Documents, preferences, AI credentials and save history live in this browser. Clearing browser data, or using **Settings → Delete all data**, removes them permanently. Export important READMEs before clearing site data or switching browsers.
`;

export function DocumentationView({ onNewDocument, onOpenTemplates }: DocumentationViewProps) {
  return (
    <div className="view-scroll">
      <div className="mx-auto w-full max-w-6xl px-6 py-9 sm:px-8 lg:py-11">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
              Documentation
            </p>
            <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.03em] text-ink">
              Everything you need to know
            </h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
              A short guide to writing, reviewing and shipping a README with README Studio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenTemplates}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[13px] font-medium text-ink shadow-sm transition-colors hover:bg-canvas"
            >
              <LayoutTemplate size={14} className="text-muted" />
              Browse templates
            </button>
            <button
              type="button"
              onClick={onNewDocument}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2C6EE4]"
            >
              <Plus size={15} />
              New README
            </button>
          </div>
        </div>

        <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="rounded-2xl border border-line bg-white px-6 py-7 shadow-card sm:px-9 sm:py-9">
            <div className="mb-6 flex items-center gap-2.5 border-b border-line pb-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-muted">
                <BookOpen size={16} strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[12.5px] font-medium text-ink">README Studio guide</p>
                <p className="text-[11px] text-muted">Version 1.0</p>
              </div>
            </div>
            <MarkdownBody markdown={documentation} />
          </article>

          <aside className="space-y-3 lg:sticky lg:top-6">
            <div className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.025)]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                <Keyboard size={13} />
                Quick shortcuts
              </div>
              <dl className="mt-3 space-y-2.5">
                {[
                  ["Save", "Ctrl / ⌘ + S"],
                  ["Undo", "Ctrl / ⌘ + Z"],
                  ["Redo", "Ctrl / ⌘ + Shift + Z"],
                  ["Finish block", "Esc"],
                ].map(([label, keys]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-[12px] text-muted">{label}</dt>
                    <dd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-[#515154]">
                      {keys}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-xl border border-accent/15 bg-accent/[0.035] p-4">
              <p className="text-[12px] font-medium text-ink">Local by design</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
                Your documents are stored only in this browser. Export them before clearing
                site data.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
