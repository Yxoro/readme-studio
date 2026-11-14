import {
  Atom,
  FileCode2,
  Gamepad2,
  GitBranch,
  Server,
  Terminal,
  UserRound,
} from "lucide-react";
import type { Template } from "../types";

export const templates: Template[] = [
  {
    id: "open-source",
    name: "Open Source Project",
    description: "A complete, community-ready structure for a public repository.",
    icon: GitBranch,
    tags: ["Badges", "Contribution", "Roadmap"],
    content: template(`# Project Name

![License](https://img.shields.io/badge/license-MIT-248A3D)
![Status](https://img.shields.io/badge/status-active-3478F6)

A focused, reliable tool that solves one problem well. Describe what the project does, who it helps, and why it matters in two or three sentences.

## Features

- Fast and lightweight by default
- Clear, predictable API
- Works in Node.js and modern browsers
- Extensively documented

## Installation

\`\`\`bash
npm install your-project-name
\`\`\`

To run the project locally:

\`\`\`bash
git clone https://github.com/your-name/your-project-name.git
cd your-project-name
npm install
npm run dev
\`\`\`

## Usage

\`\`\`js
import { createProject } from "your-project-name";

const project = createProject({
  name: "Hello world",
});

project.start();
\`\`\`

## Screenshots

![Project interface](https://placehold.co/1200x630/F5F5F7/1D1D1F?text=Project+screenshot)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Language | TypeScript |
| Runtime | Node.js |
| Testing | Vitest |

## Roadmap

- [x] Initial public release
- [ ] Configuration presets
- [ ] Plugin system
- [ ] Improved documentation

## Contributing

Contributions are welcome. Please open an issue before starting a large change, then create a branch and submit a pull request with tests where appropriate.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

Distributed under the MIT License. See \`LICENSE\` for details.
`),
  },
  {
    id: "react-app",
    name: "React Application",
    description: "A polished front-end README with setup, scripts and structure.",
    icon: Atom,
    tags: ["React", "Vite", "Structure"],
    content: template(`# App Name

![React](https://img.shields.io/badge/React-18-3478F6)
![Vite](https://img.shields.io/badge/Vite-5-248A3D)

A modern React application built with TypeScript and Vite. Replace this paragraph with the purpose of the product and the audience it serves.

## Features

- Responsive layout on every screen size
- Accessible, keyboard-friendly interactions
- Typed data layer with clear boundaries
- Fast local development with Vite

## Demo

[View the live application](https://example.com)

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

The application is available at \`http://localhost:5173\`.

### Production build

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Project Structure

\`\`\`text
src/
  components/    Reusable interface components
  hooks/         Application state and effects
  lib/           Pure helpers and adapters
  pages/         Route-level screens
  App.tsx        Application shell
\`\`\`

## Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | React |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |

## License

MIT
`),
  },
  {
    id: "python-project",
    name: "Python Project",
    description: "A clean package README with virtualenv, usage and testing.",
    icon: FileCode2,
    tags: ["Python", "pip", "Tests"],
    content: template(`# Package Name

![Python](https://img.shields.io/badge/python-3.11%2B-3478F6)
![License](https://img.shields.io/badge/license-MIT-248A3D)

A concise description of the package and the problem it solves. Mention the supported Python versions and any important constraints.

## Features

- Simple and typed public API
- Minimal dependencies
- Works with Python 3.11 and newer
- Tested on every supported platform

## Requirements

- Python 3.11 or newer
- pip

## Installation

Create and activate a virtual environment, then install the package:

\`\`\`bash
python -m venv .venv
source .venv/bin/activate
pip install package-name
\`\`\`

On Windows, activate the environment with \`.venv\\Scripts\\activate\`.

## Quick Start

\`\`\`python
from package_name import Client

client = Client(api_key="your-key")
result = client.run("Hello world")

print(result)
\`\`\`

## Usage

### Batch processing

\`\`\`python
items = ["alpha", "beta", "gamma"]
results = [client.run(item) for item in items]
\`\`\`

### Configuration

Configuration can be provided directly or through environment variables:

| Option | Default | Description |
| --- | --- | --- |
| \`timeout\` | \`30\` | Request timeout in seconds |
| \`retries\` | \`3\` | Number of retry attempts |

## Testing

\`\`\`bash
pytest
\`\`\`

## Project Structure

\`\`\`text
package_name/
  __init__.py
  client.py
tests/
  test_client.py
\`\`\`

## License

MIT. See \`LICENSE\` for details.
`),
  },
  {
    id: "godot-game",
    name: "Godot Game",
    description: "A game project README with controls, requirements and credits.",
    icon: Gamepad2,
    tags: ["Godot 4", "Controls", "Build"],
    content: template(`# Game Title

![Engine](https://img.shields.io/badge/Godot-4.x-3478F6)
![Status](https://img.shields.io/badge/status-in%20development-B25000)

A short pitch for the game: its genre, core loop, mood and what makes it distinct. Keep it readable for players and contributors alike.

## Features

- Hand-crafted levels with a consistent visual language
- Responsive controls with keyboard and gamepad support
- Original soundtrack and sound design
- Save system with three profile slots

## Screenshots

![Gameplay preview](https://placehold.co/1200x675/F5F5F7/1D1D1F?text=Gameplay+preview)

## Requirements

- Godot 4.2 or newer
- 2 GB of available memory
- Windows, macOS or Linux

## Getting Started

\`\`\`bash
git clone https://github.com/your-name/game-title.git
cd game-title
\`\`\`

Open \`project.godot\` in the Godot editor and press **F5** to run the game.

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move | Arrow keys | Left stick |
| Jump | Space | A / Cross |
| Interact | E | X / Square |
| Pause | Escape | Start |

## Project Structure

\`\`\`text
assets/          Art, audio and fonts
scenes/          Levels, menus and reusable scenes
scripts/         Gameplay and UI scripts
project.godot    Godot project configuration
\`\`\`

## Building

In the Godot editor, open **Project > Export** and choose a preset for your target platform. Export templates must be installed for the selected version.

## Roadmap

- [x] Core movement and camera
- [x] First playable level
- [ ] Additional biomes
- [ ] Localization

## Credits

- Design and code: Your Name
- Music: Collaborator Name
- Fonts: Font Name (license)

## License

The source code is licensed under MIT. Art and audio assets may use separate licenses; see \`ASSETS.md\` for details.
`),
  },
  {
    id: "api-docs",
    name: "API Documentation",
    description: "Endpoint tables, authentication and clear request examples.",
    icon: Server,
    tags: ["REST", "Auth", "Endpoints"],
    content: template(`# Service API

![Version](https://img.shields.io/badge/version-v1-3478F6)
![Status](https://img.shields.io/badge/status-stable-248A3D)

A precise reference for the Service API. It covers authentication, resources, request and response shapes, errors and rate limits.

## Base URL

\`\`\`text
https://api.example.com/v1
\`\`\`

Every request must use HTTPS. Responses are encoded as JSON.

## Authentication

Authenticate with a bearer token in the \`Authorization\` header:

\`\`\`bash
curl https://api.example.com/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

Keep API keys on the server. Never expose a secret key in browser code.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| \`GET\` | \`/projects\` | List projects |
| \`POST\` | \`/projects\` | Create a project |
| \`GET\` | \`/projects/:id\` | Retrieve a project |
| \`PATCH\` | \`/projects/:id\` | Update a project |
| \`DELETE\` | \`/projects/:id\` | Delete a project |

## Create a project

\`\`\`http
POST /v1/projects
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "name": "Documentation",
  "visibility": "private"
}
\`\`\`

A successful request returns \`201 Created\`:

\`\`\`json
{
  "id": "prj_01HZXC",
  "name": "Documentation",
  "visibility": "private",
  "createdAt": "2026-01-15T10:30:00Z"
}
\`\`\`

## Errors

| Status | Code | Meaning |
| --- | --- | --- |
| \`400\` | \`invalid_request\` | The request body is invalid |
| \`401\` | \`unauthorized\` | Missing or invalid API key |
| \`404\` | \`not_found\` | The resource does not exist |
| \`429\` | \`rate_limited\` | Too many requests |

Error responses include a message and a request identifier:

\`\`\`json
{
  "error": {
    "code": "invalid_request",
    "message": "The name field is required.",
    "requestId": "req_01HZXD"
  }
}
\`\`\`

## Rate limits

The API allows 120 requests per minute per key. The response includes:

- \`X-RateLimit-Limit\`
- \`X-RateLimit-Remaining\`
- \`X-RateLimit-Reset\`

## Versioning

Breaking changes are released under a new version prefix. Additive changes may ship within the current version.

## License

This documentation is available under the MIT License.
`),
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "A personal profile with selected work, skills and contact.",
    icon: UserRound,
    tags: ["Profile", "Projects", "Contact"],
    content: template(`# Your Name

**Product designer and front-end developer**

I design and build calm, useful digital products. Currently focused on developer tools and thoughtful interfaces.

## About

Write two or three sentences about your background, the work you enjoy, and the problems you like to solve. Keep the tone direct and specific.

## Selected Work

### Project One

A short description of the product, the problem it solved, and your contribution. Mention the outcome when it is measurable.

- Role: Product design, front-end
- Stack: React, TypeScript
- [View case study](https://example.com/work/project-one)

![Project One interface](https://placehold.co/1200x675/F5F5F7/1D1D1F?text=Project+One)

### Project Two

A polished internal tool that reduced a recurring workflow from hours to minutes.

- Role: Design systems, implementation
- Stack: React, Node.js
- [View case study](https://example.com/work/project-two)

## Skills

| Area | Tools and methods |
| --- | --- |
| Design | Interface design, prototyping, design systems |
| Front-end | React, TypeScript, CSS, accessibility |
| Collaboration | Research, facilitation, documentation |

## Contact

I am available for selected freelance projects and collaborations.

- Email: [hello@example.com](mailto:hello@example.com)
- Website: [example.com](https://example.com)
- LinkedIn: [linkedin.com/in/your-name](https://linkedin.com/in/your-name)

## License

The content of this portfolio is licensed under CC BY 4.0. Code samples are MIT licensed.
`),
  },
  {
    id: "cli-tool",
    name: "CLI Tool",
    description: "Installation, commands and examples for a command-line tool.",
    icon: Terminal,
    tags: ["Commands", "Examples", "Config"],
    content: template(`# Tool Name

![npm](https://img.shields.io/badge/npm-v1.0.0-3478F6)
![License](https://img.shields.io/badge/license-MIT-248A3D)

A small command-line tool that makes a repetitive task fast, predictable and easy to script. Describe the primary use case in one sentence.

## Features

- Zero configuration to get started
- Clear, readable output
- Works in CI environments
- Supports a project-level config file

## Installation

\`\`\`bash
npm install -g tool-name
\`\`\`

Or run it without a global install:

\`\`\`bash
npx tool-name --help
\`\`\`

## Usage

\`\`\`bash
tool-name <command> [options]
\`\`\`

### Quick start

\`\`\`bash
tool-name init
tool-name run ./src
\`\`\`

## Commands

| Command | Description |
| --- | --- |
| \`init\` | Create a starter configuration file |
| \`run <path>\` | Run the main task on a file or directory |
| \`check\` | Validate the current project |
| \`clean\` | Remove generated files |

## Options

| Option | Description |
| --- | --- |
| \`--config <file>\` | Use a custom configuration file |
| \`--watch\` | Watch files and rerun on change |
| \`--quiet\` | Only show errors |
| \`--no-color\` | Disable colored output |

## Examples

Run a check over every file:

\`\`\`bash
tool-name check --config ./config/tool.json
\`\`\`

Watch a directory while developing:

\`\`\`bash
tool-name run ./src --watch
\`\`\`

## Configuration

Create \`tool.config.json\` in the project root:

\`\`\`json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules"],
  "strict": true
}
\`\`\`

## Contributing

1. Fork the repository and create a branch
2. Install dependencies with \`npm install\`
3. Add tests for any behavior change
4. Open a pull request describing the change

## License

MIT
`),
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((template) => template.id === id);
}

function template(content: string): string {
  return content.trim();
}
