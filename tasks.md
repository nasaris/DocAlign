# DocAlign - Document Consistency Checker
## Project Tasks

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Repository & Project Structure
- [x] Create tasks.md file
- [x] Initialize Git repository
- [x] Create GitHub repository (https://github.com/nasaris/DocAlign)
- [x] Create monorepo folder structure
  - [x] `/backend` - Node.js + TypeScript REST API
  - [x] `/rag-engine` - Python + FastAPI
  - [x] `/frontend` - React + TypeScript + Material UI

### 1.2 Docker Infrastructure
- [x] Create `docker-compose.yml` with all services:
  - [x] PostgreSQL service with volume
  - [x] Qdrant service with volume
  - [x] Backend service
  - [x] RAG-engine service
  - [x] Frontend service
- [x] Configure shared Docker network (`app-network`)
- [x] Setup environment variable templates

---

## Phase 2: Backend (Node.js + TypeScript)

### 2.1 Foundation
- [x] Initialize Node.js + TypeScript project
- [x] Setup Express/Fastify
- [x] Configure logging (Winston/Pino)
- [x] Setup request validation middleware
- [x] Configure error handling

### 2.2 Database Layer
- [x] Setup Prisma/TypeORM
- [x] Create database schema:
  - [x] `projects` table (id, name, created_at, updated_at)
  - [x] `documents` table (id, project_id, title, original_filename, status, created_at, updated_at)
  - [x] `document_paragraphs` table (id, document_id, index, paragraph_id, text, html)
  - [x] `document_inconsistencies` table (id, project_id, source_document_id, target_document_id, inconsistency_type, severity, description, explanation, recommendation, source_excerpt, target_excerpt, source_paragraph_index, source_start_offset, source_end_offset, target_paragraph_index, target_start_offset, target_end_offset, created_at)
- [x] Create database migrations
- [x] Implement database models/repositories

### 2.3 Document Processing
- [x] Implement .docx parser using Mammoth.js
- [x] Implement paragraph extraction logic
- [x] Create paragraph_id generator (p-0, p-1, ...)
- [x] Implement HTML/text conversion

### 2.4 API Endpoints - Projects
- [x] `GET /projects` - List all projects
- [x] `POST /projects` - Create new project

### 2.5 API Endpoints - Documents
- [x] `GET /projects/:projectId/documents` - List documents in project
- [x] `POST /projects/:projectId/documents` - Upload .docx (multipart/form-data)
  - [x] File validation (.docx only)
  - [x] Store document record (status: "uploaded")
  - [x] Parse .docx and extract paragraphs
  - [x] Store paragraphs in database
  - [x] Update document status to "ready"
  - [x] Call RAG-engine for embedding ingestion
- [x] `GET /documents/:documentId/content` - Get document paragraphs

### 2.6 API Endpoints - Consistency Analysis
- [x] `POST /projects/:projectId/consistency/run` - Trigger consistency check
  - [x] Fetch all ready documents
  - [x] Generate document pairs
  - [x] Call RAG-engine for each pair
  - [x] Store inconsistencies in database
- [x] `GET /projects/:projectId/inconsistencies` - Get inconsistencies
  - [x] Support optional `documentId` filter

### 2.7 RAG-Engine Integration
- [x] Implement HTTP client for RAG-engine
- [x] Create `/embeddings/ingest-document` caller
- [x] Create `/consistency/analyze-pair` caller

### 2.8 Backend Dockerfile
- [x] Create `backend/Dockerfile`
- [x] Configure Node.js container
- [x] Setup production build

---

## Phase 3: RAG-Engine (Python + FastAPI)

### 3.1 Foundation
- [x] Initialize Python project with poetry/pip
- [x] Setup FastAPI application
- [x] Configure logging
- [x] Setup error handling
- [x] Create Pydantic models for request/response validation

### 3.2 Database Client
- [x] Implement PostgreSQL client (psycopg2/asyncpg)
- [x] Create connection pool
- [x] Implement paragraph fetching queries

### 3.3 Qdrant Integration
- [x] Install qdrant-client
- [x] Implement Qdrant client wrapper
- [x] Create `paragraph_embeddings` collection
  - [x] Configure vector size (1536 for text-embedding-3-small)
  - [x] Configure distance metric (COSINE)
- [x] Implement `upsert_paragraph_embedding()` function
- [x] Implement `query_similar_paragraphs()` function

### 3.4 Embedding Service
- [x] Install OpenAI Python client
- [x] Implement abstracted `generate_embedding(text: str) -> list[float]`
  - [x] Use OpenAI text-embedding-3-small
  - [x] Abstract to allow future model swapping
- [x] Add batch embedding support (optional optimization)

### 3.5 LLM Service
- [x] Implement LLM client using OpenAI API
- [x] Design consistency check prompt with:
  - [x] Inconsistency types (CONTRADICTION, MISSING_REQUIREMENT, CONFLICTING_DEFINITION, INCONSISTENT_SCOPE, DATA_MISMATCH)
  - [x] Severity levels (CRITICAL, HIGH, MEDIUM, LOW)
  - [x] JSON response schema
- [x] Implement `analyze_paragraph_pair()` function
  - [x] Call LLM with structured prompt
  - [x] Parse JSON response
  - [x] Extract: is_inconsistent, type, severity, description, explanation, recommendation, excerpts, locations

### 3.6 API Endpoints
- [x] `POST /embeddings/ingest-document`
  - [x] Input: `{ project_id, document_id }`
  - [x] Fetch paragraphs from PostgreSQL
  - [x] Generate embeddings for each paragraph
  - [x] Upsert embeddings to Qdrant with metadata
- [x] `POST /consistency/analyze-pair`
  - [x] Input: `{ project_id, doc1_id, doc2_id }`
  - [x] Load paragraphs for both documents
  - [x] For each doc1 paragraph, find top_k similar doc2 paragraphs
  - [x] Call LLM for each candidate pair
  - [x] Return list of detected inconsistencies

### 3.7 RAG-Engine Dockerfile
- [x] Create `rag-engine/Dockerfile`
- [x] Configure Python container
- [x] Install dependencies

---

## Phase 4: Frontend (React + TypeScript + Material UI)

### 4.1 Foundation
- [ ] Initialize React + TypeScript project (Vite)
- [ ] Install Material UI (@mui/material, @emotion)
- [ ] Setup project structure:
  - [ ] `/src/components`
  - [ ] `/src/pages`
  - [ ] `/src/state`
  - [ ] `/src/utils`
  - [ ] `/src/theme`
- [ ] Configure environment variables (VITE_API_URL)

### 4.2 Monochrome Theme
- [ ] Create custom MUI theme in `/src/theme`
- [ ] Configure colors:
  - [ ] Primary: shades of gray
  - [ ] Secondary: shades of gray
  - [ ] Background: white/light gray
  - [ ] Text: black/dark gray
- [ ] Define severity-based highlight styles:
  - [ ] `.highlight-critical`: `rgba(0, 0, 0, 0.85)`, white text
  - [ ] `.highlight-high`: `rgba(0, 0, 0, 0.65)`, white text
  - [ ] `.highlight-medium`: `rgba(0, 0, 0, 0.45)`, white text
  - [ ] `.highlight-low`: `rgba(0, 0, 0, 0.25)`, black text

### 4.3 State Management
- [ ] Setup Zustand/Redux Toolkit
- [ ] Create stores:
  - [ ] Projects store (list, selected project)
  - [ ] Documents store (list, selected document)
  - [ ] Inconsistencies store (list, selected inconsistency)
- [ ] Implement API client functions

### 4.4 Layout Structure
- [ ] Create main layout component (three-part)
- [ ] Implement Left Sidebar (fixed width)
- [ ] Implement Center Content Area (document viewer)
- [ ] Implement Right Panel (inconsistency details)

### 4.5 Left Sidebar
- [ ] **Top Section:**
  - [ ] Project dropdown (MUI Select)
  - [ ] "New Project" button
  - [ ] New Project dialog/modal
- [ ] **Middle Section:**
  - [ ] Document list (clickable titles)
  - [ ] Show document status
- [ ] **Bottom Section:**
  - [ ] Drag & Drop upload zone (MUI Box/Paper)
  - [ ] "Drop .docx files here or click to upload" text
  - [ ] Drag-over styling
  - [ ] Click-to-select-file behavior
  - [ ] File upload handler (multipart/form-data)
  - [ ] Success/error toast notifications (MUI Snackbar)

### 4.6 Center: Document Viewer
- [ ] Fetch document content on selection
- [ ] Render paragraphs in order
- [ ] Implement inline highlighting:
  - [ ] Parse inconsistency locations (paragraph_index, start_offset, end_offset)
  - [ ] Split paragraph text into segments
  - [ ] Wrap highlighted segments in `<span>` with severity class
- [ ] Implement scroll-to-paragraph functionality
- [ ] Handle highlight click events

### 4.7 Right Panel: Inconsistency Details
- [ ] Fetch inconsistencies for selected document
- [ ] Display inconsistency list:
  - [ ] Type badge
  - [ ] Severity indicator (monochrome)
  - [ ] Short description
  - [ ] Source excerpt (truncated)
- [ ] Implement inconsistency selection
- [ ] Display full details on selection:
  - [ ] Full explanation
  - [ ] Recommendation
  - [ ] Both excerpts (source & target)
- [ ] Implement click-to-scroll-to-highlight

### 4.8 Interactions & Synchronization
- [ ] Sync highlight click → select inconsistency in right panel
- [ ] Sync inconsistency click → scroll to highlight in viewer
- [ ] Visual focus state for selected highlight
- [ ] Update document list after upload

### 4.9 Additional Features
- [ ] "Run Consistency Check" button (triggers analysis)
- [ ] Loading states (spinners/progress indicators)
- [ ] Error handling and error boundaries
- [ ] Empty states (no projects, no documents, no inconsistencies)

### 4.10 Frontend Dockerfile
- [ ] Create `frontend/Dockerfile`
- [ ] Configure Node.js build container
- [ ] Setup nginx for production serving

---

## Phase 5: Integration & Testing

### 5.1 Environment Configuration
- [x] Create `.env.example` for backend
- [x] Create `.env.example` for rag-engine
- [ ] Create `.env.example` for frontend
- [x] Document required environment variables:
  - [x] OpenAI API key
  - [x] PostgreSQL credentials
  - [x] Qdrant URL
  - [x] Backend/RAG-engine URLs

### 5.2 Docker Compose Testing
- [ ] Test `docker-compose up` from scratch
- [ ] Verify all services start correctly
- [ ] Verify network connectivity between services
- [ ] Test PostgreSQL migrations
- [ ] Test Qdrant collection creation

### 5.3 End-to-End Testing
- [ ] Test project creation
- [ ] Test document upload (.docx)
- [ ] Test paragraph extraction and storage
- [ ] Test embedding generation and Qdrant storage
- [ ] Test consistency analysis trigger
- [ ] Test inconsistency detection with real documents
- [ ] Test frontend visualization
- [ ] Test highlight interactions

### 5.4 Error Handling & Edge Cases
- [ ] Test with invalid file types
- [ ] Test with corrupted .docx files
- [ ] Test with empty documents
- [ ] Test with single document (< 2 docs)
- [ ] Test with very large documents
- [ ] Test OpenAI API failures
- [ ] Test database connection failures
- [ ] Test Qdrant connection failures

---

## Phase 6: Documentation & Deployment

### 6.1 Documentation
- [x] Create comprehensive README.md:
  - [x] Project overview
  - [x] Architecture diagram
  - [x] Technology stack
  - [x] Setup instructions
  - [x] Environment variables reference
  - [x] API documentation
  - [ ] Troubleshooting guide
- [ ] Add code comments and docstrings
- [ ] Create API documentation (Swagger/OpenAPI)

### 6.2 Code Quality
- [x] Add TypeScript strict mode
- [ ] Add ESLint/Prettier for frontend & backend
- [ ] Add Pylint/Black for rag-engine
- [ ] Add pre-commit hooks
- [ ] Review and refactor code

### 6.3 Optional Enhancements
- [ ] Implement background job queue for analysis (Bull/Celery)
- [ ] Add progress tracking for long-running analyses
- [ ] Add user authentication
- [ ] Add export functionality (PDF/CSV)
- [ ] Add inconsistency filtering and sorting
- [ ] Add pagination for large document/inconsistency lists
- [ ] Implement local embedding model option
- [ ] Add caching layer (Redis)

---

## Summary

**Total Tasks:** ~150+

**Key Milestones:**
1. Infrastructure & Docker setup complete
2. Backend API fully functional
3. RAG-engine operational with embeddings & LLM
4. Frontend UI complete with all interactions
5. End-to-end workflow tested
6. Production-ready deployment

**Critical Path:**
Infrastructure → Backend → RAG-Engine → Frontend → Integration → Testing

**Estimated Timeline:** 2-4 weeks (depending on team size and experience)

---

## Notes

- **NO rule engine:** All inconsistency detection logic is delegated to the LLM
- **Monochrome only:** All UI elements use black, white, and gray shades
- **Production-grade:** Clean architecture, proper error handling, logging, validation
- **Containerized:** Everything runs via `docker-compose up`
- **Abstracted embeddings:** Easy to swap OpenAI for local models later
