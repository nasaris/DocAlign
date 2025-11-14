# DocAlign Frontend

React + TypeScript + Material UI frontend with strict monochrome design.

## Features

- **Monochrome Design**: Pure black, white, and gray theme
- **Three-Part Layout**: Sidebar, Document Viewer, Inconsistency Panel
- **Project Management**: Create and select projects
- **Drag & Drop Upload**: Upload .docx files with visual feedback
- **Document Viewer**: Render paragraphs with inline highlighting
- **Inconsistency Details**: Interactive panel with explanations
- **Bidirectional Sync**: Click highlights or inconsistencies to navigate

## Tech Stack

- React 18
- TypeScript
- Vite
- Material UI (MUI)
- Zustand (state management)
- Axios (API client)
- react-dropzone (file upload)

## Setup

```bash
npm install
```

## Environment Variables

Create `.env` based on `.env.example`:

```env
VITE_API_URL=http://localhost:4000
```

## Development

```bash
npm run dev
```

Runs on http://localhost:3000

## Production Build

```bash
npm run build
npm run preview
```

## Docker

```bash
docker build -t docalign-frontend .
docker run -p 3000:3000 docalign-frontend
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # Three-part layout
│   │   ├── LeftSidebar.tsx         # Project & document management
│   │   ├── UploadZone.tsx          # Drag & drop upload
│   │   ├── DocumentViewer.tsx      # Document with highlights
│   │   └── RightPanel.tsx          # Inconsistency details
│   ├── state/
│   │   └── useStore.ts             # Zustand global state
│   ├── theme/
│   │   └── monochromeTheme.ts      # MUI monochrome theme
│   ├── utils/
│   │   └── api.ts                  # API client
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
└── Dockerfile
```

## Monochrome Design

### Colors
- Primary: `#000000` (black)
- Secondary: `#666666` (gray)
- Background: `#ffffff` (white)
- Paper: `#f5f5f5` (light gray)
- Text: `#000000` / `#666666`

### Highlight Severity
- **CRITICAL**: `rgba(0, 0, 0, 0.85)` - Nearly black
- **HIGH**: `rgba(0, 0, 0, 0.65)` - Dark gray
- **MEDIUM**: `rgba(0, 0, 0, 0.45)` - Medium gray
- **LOW**: `rgba(0, 0, 0, 0.25)` - Light gray

No colored accents allowed!
