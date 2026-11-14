# Nimbus

![License](https://img.shields.io/badge/license-MIT-248A3D)
![Status](https://img.shields.io/badge/status-concept-3478F6)

Nimbus is a small weather journal for people who would rather notice patterns than read a forecast. It records the sky you actually saw and draws a quiet calendar of it.

> This document ships with README Studio as a demo. Import it, edit a section, and watch the preview and quality score respond.

## Features

- One-tap entries for sky, temperature and mood
- A monthly calendar that reads at a glance
- Plain-text and Markdown export
- Works offline and keeps every entry on the device

## Installation

Clone the repository and start the development server:

```bash
git clone https://github.com/your-name/nimbus.git
cd nimbus
npm install
npm run dev
```

Open `http://localhost:5173` in a browser.

## Usage

Create an entry from the home screen:

```js
import { createEntry } from "nimbus";

await createEntry({
  sky: "overcast",
  temperature: 12,
  note: "First cold morning of the year.",
});
```

The entry appears in the calendar immediately. Search finds notes by keyword, and every entry stays editable.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| New entry | `N` |
| Search notes | `/` |
| Export journal | `Ctrl / ⌘ + S` |
| Close a dialog | `Esc` |

## Project structure

```text
src/
  components/    Calendar, entry form and dialogs
  lib/           Storage, dates and export helpers
  App.tsx        Application shell
```

## Roadmap

- [x] Daily entries and calendar view
- [x] Local export
- [ ] Monthly summaries
- [ ] Optional weather API import

## License

MIT. See `LICENSE` for details.
