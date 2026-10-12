# Ubuntu Learning Desktop

A browser-based Linux, cloud, and DevOps learning workspace built with React. It uses an Ubuntu-inspired desktop interface with a simulated file manager, terminal, lessons, and practical cloud labs.

## Features

- Ubuntu-style desktop with a bottom application dock.
- Simulated Linux terminal with commands for browsing and managing practice files.
- File manager with folders, documents, rename, search, and Trash.
- Beginner learning paths for Linux, cloud fundamentals, AWS, Microsoft Azure, Google Cloud, DevOps, and server engineering.
- Cloud Lab with provider-specific sections for visual request flow, permissions, networking, database planning, security checks, and CLI practice.
- Lesson and practice data saved locally in the browser.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Cloud lab notes

AWS CLI, Azure CLI, and `gcloud` examples run in a local simulation. The app does not connect to cloud provider accounts, use credentials, create billable resources, or make cloud API calls. Simulated resources remain in the browser session and are for learning command syntax and concepts.

## Project structure

```text
index.html
src/
  App.jsx       React desktop, learning paths, and simulated labs
  main.jsx      React application entry point
  styles.css    Desktop and app styling
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |

