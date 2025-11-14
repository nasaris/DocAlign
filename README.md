# DocAlign

> **AI-powered semantic document consistency checker using RAG, embeddings, and LLM analysis**

DocAlign is a full-stack web application that analyzes multiple Word documents for semantic inconsistencies using OpenAI embeddings, Qdrant vector search, and LLM-based decision making.

![Status](https://img.shields.io/badge/status-in--development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Overview

DocAlign helps teams maintain consistency across multiple documents by:

- **Semantic Analysis**: Uses embeddings to find semantically similar paragraphs across documents
- **LLM-Powered Detection**: Leverages GPT-4 to identify inconsistencies with explanations
- **Monochrome UI**: Clean, professional black & white interface built with Material UI
- **Containerized**: Fully dockerized with docker-compose for easy deployment

### Key Features

✅ Upload multiple .docx documents to projects
✅ Automatic paragraph extraction and semantic indexing
✅ AI-powered inconsistency detection with severity levels
✅ Inline document viewer with monochrome highlights
✅ Detailed explanations and recommendations for each issue
✅ No hand-written rule engine - all decisions by LLM

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│              React + TypeScript + Material UI               │
│                    (Monochrome Theme)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST API
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                        Backend                              │
│              Node.js + TypeScript + Express                 │
│                   (Document Processing)                     │
└───────────┬─────────────────────────────┬───────────────────┘
            │                             │
            │                             │ HTTP
            │                             │
┌───────────▼──────────┐      ┌──────────▼──────────────────┐
│    PostgreSQL        │      │      RAG-Engine             │
│  (Relational Data)   │◄─────┤  Python + FastAPI           │
└──────────────────────┘      │  (Embeddings + Analysis)    │
                              └──────────┬──────────────────┘
                                         │
                                         │
                              ┌──────────▼──────────────────┐
                              │        Qdrant               │
                              │   (Vector Database)         │
                              └─────────────────────────────┘
```

### Technology Stack

**Backend**
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL

**RAG-Engine**
- Python + FastAPI
- OpenAI Embeddings (text-embedding-3-small)
- OpenAI GPT-4 (for inconsistency detection)
- Qdrant (vector database)
- qdrant-client

**Frontend**
- React + TypeScript
- Vite
- Material UI (MUI)
- Zustand (state management)

**Infrastructure**
- Docker + Docker Compose
- PostgreSQL (relational database)
- Qdrant (vector database)

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- OpenAI API Key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nasaris/DocAlign.git
   cd DocAlign
   ```

2. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your database credentials

   # RAG-Engine
   cp rag-engine/.env.example rag-engine/.env
   # Edit rag-engine/.env and add your OpenAI API key

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env if needed
   ```

3. **Start all services**
   ```bash
   docker-compose up
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - RAG-Engine API: http://localhost:8000
   - Qdrant Dashboard: http://localhost:6333/dashboard

---

## 📋 Usage

### 1. Create a Project
- Click "New Project" in the left sidebar
- Enter a project name

### 2. Upload Documents
- Select a project from the dropdown
- Drag & drop .docx files into the upload zone
- Wait for processing to complete

### 3. Run Consistency Check
- Click "Run Consistency Check"
- Wait for analysis to complete

### 4. Review Inconsistencies
- Click on highlights in the document viewer
- Review details in the right panel
- See explanation, severity, and recommendations

---

## 🗂️ Project Structure

```
DocAlign/
├── backend/                # Node.js + TypeScript REST API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models (Prisma)
│   │   └── utils/         # Helper functions
│   ├── prisma/            # Database schema & migrations
│   ├── Dockerfile
│   └── package.json
│
├── rag-engine/            # Python + FastAPI
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── embeddings/    # Embedding generation
│   │   ├── analysis/      # LLM-based analysis
│   │   └── clients/       # Database & Qdrant clients
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/              # React + TypeScript + Material UI
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── state/         # Zustand stores
│   │   ├── theme/         # MUI monochrome theme
│   │   └── utils/         # Helper functions
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml     # Service orchestration
├── tasks.md              # Development tasks
└── README.md
```

---

## 🔧 Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### RAG-Engine

```bash
cd rag-engine
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Database Schema

### Tables

**projects**
- `id` (UUID, PK)
- `name` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**documents**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects.id)
- `title` (string)
- `original_filename` (string)
- `status` (enum: uploaded | ready | error)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**document_paragraphs**
- `id` (UUID, PK)
- `document_id` (UUID, FK → documents.id)
- `index` (int) - 0-based paragraph index
- `paragraph_id` (string) - e.g., "p-0", "p-1"
- `text` (text)
- `html` (text)

**document_inconsistencies**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects.id)
- `source_document_id` (UUID)
- `target_document_id` (UUID)
- `inconsistency_type` (enum: CONTRADICTION | MISSING_REQUIREMENT | CONFLICTING_DEFINITION | INCONSISTENT_SCOPE | DATA_MISMATCH)
- `severity` (enum: CRITICAL | HIGH | MEDIUM | LOW)
- `description` (text)
- `explanation` (text)
- `recommendation` (text)
- `source_excerpt` (text)
- `target_excerpt` (text)
- `source_paragraph_index` (int)
- `source_start_offset` (int)
- `source_end_offset` (int)
- `target_paragraph_index` (int)
- `target_start_offset` (int)
- `target_end_offset` (int)
- `created_at` (timestamp)

---

## 🎨 UI Design Philosophy

DocAlign uses a **strict monochrome design**:
- Colors: Black, white, and shades of gray only
- Highlights use varying opacity levels of black
- No colored accents (no blue, red, green, etc.)
- Professional, document-focused aesthetic

### Severity Highlighting

```css
.highlight-critical { background: rgba(0, 0, 0, 0.85); color: #fff; }
.highlight-high     { background: rgba(0, 0, 0, 0.65); color: #fff; }
.highlight-medium   { background: rgba(0, 0, 0, 0.45); color: #fff; }
.highlight-low      { background: rgba(0, 0, 0, 0.25); color: #000; }
```

---

## 🧪 API Documentation

### Backend API

**Projects**
- `GET /projects` - List all projects
- `POST /projects` - Create a new project

**Documents**
- `GET /projects/:projectId/documents` - List documents in project
- `POST /projects/:projectId/documents` - Upload .docx file
- `GET /documents/:documentId/content` - Get document paragraphs

**Consistency Analysis**
- `POST /projects/:projectId/consistency/run` - Trigger analysis
- `GET /projects/:projectId/inconsistencies?documentId=...` - Get inconsistencies

### RAG-Engine API

**Embeddings**
- `POST /embeddings/ingest-document` - Generate & store embeddings for a document

**Analysis**
- `POST /consistency/analyze-pair` - Analyze two documents for inconsistencies

---

## 🔒 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@db:5432/docalign
RAG_ENGINE_URL=http://rag-engine:8000
PORT=4000
```

### RAG-Engine (.env)
```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:password@db:5432/docalign
QDRANT_URL=http://qdrant:6333
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
```

---

## 🤝 Contributing

Contributions are welcome! Please see [tasks.md](tasks.md) for current development tasks.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Built with OpenAI's embedding and language models
- Powered by Qdrant vector database
- UI components from Material-UI

---

**Status**: 🚧 In Development

See [tasks.md](tasks.md) for detailed progress tracking.
