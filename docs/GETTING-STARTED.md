# Getting started with README Studio

README Studio is a local-first Markdown workspace for drafting, previewing and polishing README files. There is no account and no application backend: documents, preferences and AI credentials stay in your browser.

This guide takes you from a fresh clone to an exported `README.md`. For a quick visual tour, start with the [demo](../demo/README.md).

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A modern browser with `localStorage` and `fetch` support
- Optional: an OpenAI-compatible API key for the AI assistant

## Install and run

```bash
git clone https://github.com/Yxoro/readme-studio.git
cd readme-studio
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. If that port is already in use, Vite picks the next free one and prints it.

To open the app from another device on your network:

```bash
npm run dev -- --host
```

The first load shows the welcome screen. The workspace appears once you create or import a document.

## Your first README

1. Select **New README** in the sidebar. The document is created with a unique name and opened immediately.
2. Rename it in the top bar. The name is a workspace label, not the exported filename.
3. Write in one of two modes:
   - **Visual Editor** renders the document as formatted blocks. Click a block to edit its Markdown inline, then press **Done**, `Esc` or `Ctrl / ⌘ + Enter`.
   - **Raw Markdown** exposes the complete source in a monospace editor.
4. Open the preview with the panel button in the top bar, then use its **Preview** and **Quality** tabs.
5. Export when you are ready. **Export README.md** downloads the Markdown source, not the rendered HTML.

You can also start from a complete structure with **Templates**, or insert individual sections with **Components**.

## Import an existing README

Select **Import** in the top bar and choose a file. Accepted formats are `.md`, `.markdown`, `.mdown` and `.txt`, up to 2 MB.

Import always creates a new document, so your existing work is never overwritten. The document name comes from the filename.

To follow the guided tour, import [`demo/sample-readme.md`](../demo/sample-readme.md).

## Templates

Templates create a new document and leave everything else untouched.

| Template | Best for |
| --- | --- |
| Open Source Project | Public repositories and community work |
| React Application | Front-end applications built with React |
| Python Project | Packages, libraries and command-line tools |
| Godot Game | Game projects and playable builds |
| API Documentation | REST services and developer APIs |
| Portfolio | Personal profiles and selected work |
| CLI Tool | Command-line utilities and developer tools |

## Components

**Components** inserts a prepared section at the cursor: project description, features, installation, usage, screenshots, tech stack, roadmap, contributing, license, acknowledgements, badges and live demo.

Inserted sections are ordinary Markdown. Edit or delete them like anything else you write. If no document is open, selecting a component creates one first.

## The editor toolbar

The toolbar inserts real Markdown syntax at the cursor. Select text to wrap it, or place the cursor on a line to apply a heading, list, quote or divider.

| Action | Syntax |
| --- | --- |
| Heading 1, 2, 3 | `#`, `##`, `###` |
| Bold | `**text**` |
| Italic | `*text*` |
| Inline code | `` `code` `` |
| Code block | Fenced code block |
| Bullet list | `- item` |
| Numbered list | `1. item` |
| Link | `[label](https://example.com)` |
| Image | `![alt](https://example.com/image.png)` |
| Table | GFM pipe table |
| Blockquote | `> quote` |
| Horizontal rule | `---` |

Below the editor you can see word count, character count and estimated reading time.

## Quality score

The **Quality** tab analyzes the document currently in the editor and reports a score out of 100.

| Check | Points |
| --- | --- |
| Project title (H1) | 30 |
| Description below the title | 20 |
| Installation or getting started section | 20 |
| Usage or examples section | 20 |
| License information | 10 |

Images without alt text, malformed links and headings with no content underneath each deduct up to 10 points. The score and recommendations update as you type, so you can watch a document improve in real time.

## The AI assistant

The assistant is optional. It uses your own API key and talks directly to an OpenAI-compatible chat completions endpoint.

1. Open a document and select **AI** in the top bar.
2. Choose **Add API key**.
3. Enter the API base URL, a model name and your key.
4. Use **Test connection**, then **Save settings**.

The default configuration points to Z.ai:

| Setting | Default |
| --- | --- |
| API base URL | `https://api.z.ai/api/paas/v4` |
| Model | `glm-4-flash` |
| API style | OpenAI-compatible chat completions |

The app appends `/chat/completions` to the base URL unless it is already included.

Describe an edit in plain language. The assistant returns the complete updated README, and the editor applies it live while the response streams. Stop a generation from the panel header, and undo with `Ctrl / ⌘ + Z`.

The **Promo README** tab turns a raw idea into a concept README without needing an existing project. It creates a new document when generation finishes.

Some providers block browser requests with CORS. If **Test connection** reports a network failure, use an endpoint that allows direct browser requests.

## Saving and your data

Changes autosave about half a second after you stop typing, with a **Saving / Saved / Not saved** indicator in the top bar. `Ctrl / ⌘ + S` saves immediately.

Documents, the active document, preferences and AI credentials are stored in this browser's `localStorage`. Adding a document in one browser does not make it appear in another.

**Settings → Delete all data** removes documents, preferences and AI credentials permanently. Export important READMEs first.

## Build and preview

```bash
npm run build
npm run preview
```

`npm run build` type-checks the project with `tsc --noEmit` and then creates the production bundle in `dist/`. `npm run preview` serves that bundle locally.

There is no test script yet. Verify a change with `npm run build` plus a manual pass of the flow you touched.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The printed URL does not open | Vite chose a different port | Use the exact URL from the terminal |
| “Not saved” or a storage warning | Browser storage is blocked or full | Allow site data, free space, and export important documents |
| `Test connection` fails with a network error | The provider blocks browser requests (CORS) | Use a CORS-enabled endpoint |
| AI returns 401 or 403 | Invalid key or no access to the model | Check the key and model name |
| AI returns 404 | Wrong base URL or model | Confirm both values in the AI settings |
| Import is rejected | Wrong extension or file over 2 MB | Convert to Markdown and keep it under the limit |
| `npm run build` fails on unused variables | TypeScript strict mode with `noUnusedLocals` | Remove the unused value or use it |
| An exported README cannot be found | The browser blocked the download | Allow downloads for the local site and try again |

## Where to go next

- [Architecture](ARCHITECTURE.md) — how the editor, storage, quality score and AI layer fit together
- [Demo](../demo/README.md) — the sample document and the one-minute tour
- [Contributing](../CONTRIBUTING.md) — setup, conventions and how to get a change merged
