# Contributing to README Studio

README Studio is co-authored in the open. Every guide, template, quality check and accessibility fix in this repository started as a small contribution, so you do not need to be a maintainer to shape it.

This guide covers local setup, the conventions the codebase follows, and what makes a pull request easy to review.

## Ways to contribute

| Contribution | Start here |
| --- | --- |
| Report a bug | [Open an issue](https://github.com/Yxoro/readme-studio/issues/new) with steps, browser and expected result |
| Request a feature | Describe the outcome you want and the workflow it unblocks |
| Improve the documentation | Fix a guide in `docs/`, the in-app copy, or the README |
| Add a template or component | Extend `src/templates/index.ts` or `src/lib/componentsLibrary.ts` |
| Improve accessibility or design | Keep the existing visual language, then show what changed and why |
| Share the project | A clear write-up of how you use it is genuinely useful feedback |

Small fixes — a typo, a broken link, an unclear sentence — can go straight to a pull request. For anything larger, open or comment on an issue first so the direction is agreed before you write code.

## Set up the project

Requirements: Node.js 18 or newer and npm 9 or newer.

```bash
git clone https://github.com/Yxoro/readme-studio.git
cd readme-studio
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`. Import [`demo/sample-readme.md`](demo/sample-readme.md) to get a real document on screen.

Before opening a pull request:

```bash
npm run build
```

This runs `tsc --noEmit` and creates the production bundle. There is no test script yet, so also walk through the flow you changed in the browser, at a narrow window width as well as a wide one.

More detail lives in the [getting started guide](docs/GETTING-STARTED.md) and the [architecture notes](docs/ARCHITECTURE.md).

## Project conventions

### TypeScript

- Strict mode is on, including `noUnusedLocals` and `noUnusedParameters`.
- Avoid `any`; accept `unknown` and narrow it, as the storage and AI layers do.
- Keep pure logic in `src/lib` and rendering in `src/components`. Anything that can be computed from Markdown alone should not need React.
- Do not add a runtime dependency without discussing it first. The app is deliberately small.

### State and persistence

- The Markdown string is the single source of truth. Do not add a second copy of document content in component state.
- Persist through `src/lib/storage.ts`. Storage keys are versioned (`.v1`); changing a stored shape means bumping the version and handling the old value.
- Keep the local-first promise: no backend calls, no analytics, no unexpected network requests. The only outbound request is the AI panel, to the endpoint the user configured.
- Undo history is intentionally in-memory only. Do not persist it without a migration plan.

### Interface and design

- Use the tokens in `tailwind.config.js` (`canvas`, `surface`, `ink`, `muted`, `line`, `accent`, `success`, `warning`, `danger`) instead of new hex values.
- Match the existing elevation and radius scale: `shadow-card`, `shadow-lift`, `rounded-lg` for controls, `rounded-xl` and `rounded-2xl` for surfaces.
- Respect the component sizes already in use: `h-8` for icon and toolbar buttons, `h-9` to `h-10` for primary actions.
- Every interactive element needs a visible `focus-visible` ring and an accessible name.
- Panels overlay the editor below `xl`; keep that responsive behavior when adding a panel.
- Use Lucide icons at 12–18 px with a 1.7–2 stroke width. Icons support labels; they do not replace them.

### Copy

- Write calm, direct sentences. No exclamation marks, hype or superlatives.
- Never invent metrics, testimonials, customers, funding or launch dates — in the UI or in AI prompts.
- Call the product **README Studio**. The wordmark reads “Readme.studio”.
- Keep existing terminology: Visual Editor, Raw Markdown, Templates, Components, Quality, Promo README.

### AI prompts

Prompts live in `src/lib/ai.ts`. Changes there should preserve the honesty rules: return only Markdown, never wrap the whole README in a fence, never fabricate traction, and keep the language of the existing document unless asked otherwise. Test with a real provider only if you already have a key; otherwise describe the change and what you could not run.

## Adding a template

Templates are plain objects in `src/templates/index.ts`:

```ts
{
  id: "my-template",
  name: "My Template",
  description: "One sentence describing who it is for.",
  icon: FileCode2,
  tags: ["Tag", "Tag"],
  content: template(`# Project Name ...`),
}
```

The `content` field holds the complete document as a template literal: a title, a description, installation, usage and license.

Guidelines:

- Use an existing Lucide icon that matches the project type.
- Keep the `template()` wrapper so leading and trailing whitespace is trimmed.
- Include a title, a description of at least one sentence and a License section so the template scores well in Quality.
- Use realistic placeholders such as `your-name` and `example.com`. Do not present invented products as real.

## Adding a component section

Sections live in `src/lib/componentsLibrary.ts` as `ComponentSection` values. A section is inserted at the cursor, so it must be valid Markdown on its own:

- Start with an `##` heading.
- Keep it short and editable; avoid nested templates or instructions aimed at the contributor.
- Pick one Lucide icon and a one-line description that explains when to use it.
- Add the section to the list; the library and the insert flow pick it up automatically.

## Before opening a pull request

- `npm run build` passes.
- The change works in `npm run dev` at desktop and narrow widths.
- Keyboard access still works: `Esc` closes dialogs, `Ctrl / ⌘ + Enter` finishes a block, `Ctrl / ⌘ + S` saves.
- The diff is focused. Unrelated formatting churn makes review harder.
- Screenshots are included for interface changes, showing before and after.
- The description covers what changed, why, and how to verify it.

## Pull request checklist

- [ ] The change is scoped to one outcome
- [ ] `npm run build` passes
- [ ] The affected flow was checked in the browser
- [ ] Interface changes respect the design tokens and existing component sizes
- [ ] Documentation is updated when behavior or setup changed
- [ ] No secrets, API keys or local storage dumps are included

## Commit messages

Use a short imperative summary, for example `Add CLI template` or `Fix link validation in quality checker`. Add a body when the reasoning is not obvious. There is no strict convention beyond readability.

## Review

A maintainer reviews every pull request. Expect questions about scope, accessibility and the local-first constraint. Small, focused pull requests are merged fastest, and a maintainer may ask to split a large one. If a review stalls, a polite comment on the pull request is enough.

## Reporting bugs

Include:

- Browser and operating system
- Steps that reproduce the problem
- What you expected and what happened
- Console errors, if any
- Whether storage works in that browser profile

Never paste an API key, a full local storage dump or private document content into an issue.

## Code of conduct

Be respectful and assume good faith. Harassment, personal attacks and dismissive behavior are not welcome. Maintainers may edit, close or remove contributions that ignore these expectations.

## License

README Studio is released under the MIT License, as described in the [README](README.md). By contributing, you agree that your changes are licensed under the same terms.
