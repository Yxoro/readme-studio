# Demo

A one-minute tour of README Studio, using a finished document instead of a blank page.

## Files

| File | Purpose |
| --- | --- |
| [`sample-readme.md`](sample-readme.md) | A complete README you can import, edit and export |

## Run the tour

1. Start the app from the repository root:

   ```bash
   npm install
   npm run dev
   ```

2. Open the URL Vite prints, usually `http://localhost:5173`.
3. Select **Import** in the top bar and choose `demo/sample-readme.md`.
4. In the Visual Editor, click the paragraph under the title and rewrite a sentence. The preview updates as you type.
5. Open the **Quality** tab in the preview panel. The sample scores 100; remove its `## License` heading and watch the score and recommendations react.
6. Press `Ctrl / ⌘ + S`, then **Export README.md** to download the file.

## What to look at

- **Visual versus raw** — switch modes in the editor header; both edit the same Markdown source.
- **Components** — insert a ready-made section at the cursor, then edit it like any other Markdown.
- **Preview** — GitHub-flavored rendering with tables, code highlighting and task lists.
- **Quality** — five core sections worth 100 points, minus accessibility, link and empty-section issues.

The demo document is ordinary Markdown. Nothing leaves your browser, and the imported document is stored next to your own work until you delete it.

Continue with the [getting started guide](../docs/GETTING-STARTED.md) or the [architecture notes](../docs/ARCHITECTURE.md).
