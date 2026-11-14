import {
  AlignLeft,
  Download,
  GitPullRequest,
  Image,
  Layers,
  ListChecks,
  Map,
  Play,
  Scale,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";
import type { ComponentSection } from "../types";

export const componentSections: ComponentSection[] = [
  {
    id: "description",
    name: "Project Description",
    description: "A concise introduction that explains the project and its audience.",
    icon: AlignLeft,
    content: `## Project Description

A short, clear explanation of what this project does, who it is for and why it exists. Keep this section to one or two paragraphs.
`,
  },
  {
    id: "features",
    name: "Features",
    description: "A scannable list of the capabilities that matter most.",
    icon: ListChecks,
    content: `## Features

- Fast, focused and easy to get started with
- Accessible and responsive by default
- Clear public API with typed interfaces
- Well documented with practical examples
`,
  },
  {
    id: "installation",
    name: "Installation",
    description: "The exact commands needed to install and run the project.",
    icon: Download,
    content: `## Installation

\`\`\`bash
npm install your-package-name
\`\`\`

To run the project from source:

\`\`\`bash
git clone https://github.com/your-name/your-project.git
cd your-project
npm install
npm run dev
\`\`\`
`,
  },
  {
    id: "usage",
    name: "Usage",
    description: "A short code example that shows the happy path.",
    icon: Terminal,
    content: `## Usage

\`\`\`js
import { start } from "your-package-name";

start({
  option: "value",
});
\`\`\`

Describe the result and any important configuration options below the example.
`,
  },
  {
    id: "screenshots",
    name: "Screenshots",
    description: "A visual section with space for product screenshots.",
    icon: Image,
    content: `## Screenshots

![Main interface](https://placehold.co/1200x630/F5F5F7/1D1D1F?text=Main+interface)

Add a caption that explains what the screenshot shows.
`,
  },
  {
    id: "tech-stack",
    name: "Tech Stack",
    description: "A compact table of the languages, tools and services used.",
    icon: Layers,
    content: `## Tech Stack

| Layer | Technology |
| --- | --- |
| Language | TypeScript |
| Framework | React |
| Build tool | Vite |
| Styling | Tailwind CSS |
`,
  },
  {
    id: "roadmap",
    name: "Roadmap",
    description: "Planned work written as an honest, simple checklist.",
    icon: Map,
    content: `## Roadmap

- [x] Initial release
- [ ] Configuration presets
- [ ] Improved documentation
- [ ] Community extensions
`,
  },
  {
    id: "contributing",
    name: "Contributing",
    description: "How others can set up, test and submit changes.",
    icon: GitPullRequest,
    content: `## Contributing

Contributions are welcome. Please open an issue before starting a large change.

1. Fork the repository
2. Create a feature branch
3. Add tests for your change
4. Open a pull request with a clear description
`,
  },
  {
    id: "license",
    name: "License",
    description: "A plain statement of how the project can be used.",
    icon: Scale,
    content: `## License

Distributed under the MIT License. See \`LICENSE\` for more information.
`,
  },
  {
    id: "acknowledgements",
    name: "Acknowledgements",
    description: "Credit the people, libraries and resources that helped.",
    icon: Users,
    content: `## Acknowledgements

- Thanks to everyone who reviewed early versions of this project
- Built with [Name of library](https://example.com)
- Inspired by [Name of project](https://example.com)
`,
  },
  {
    id: "badges",
    name: "GitHub Badges",
    description: "A row of status badges for the top of a README.",
    icon: ShieldCheck,
    content: `![Build](https://img.shields.io/badge/build-passing-248A3D)
![Version](https://img.shields.io/badge/version-1.0.0-3478F6)
![License](https://img.shields.io/badge/license-MIT-1D1D1F)
`,
  },
  {
    id: "demo",
    name: "Live Demo",
    description: "A prominent link to a deployed demo or preview.",
    icon: Play,
    content: `## Live Demo

[Open the live demo](https://example.com)

The demo runs on synthetic data and resets every hour.
`,
  },
];
