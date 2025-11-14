# DocAlign Backend

Node.js + TypeScript + Express REST API for DocAlign document consistency checker.

## Features

- **Project Management**: Create and manage document projects
- **Document Upload**: Upload .docx files with automatic paragraph extraction
- **Consistency Analysis**: Orchestrate document pair analysis via RAG-engine
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- Node.js 20
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Mammoth.js (for .docx parsing)
- Winston (logging)
- Multer (file uploads)

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- RAG-engine running

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/docalign"
PORT=4000
RAG_ENGINE_URL=http://localhost:8000
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Optional: Open Prisma Studio
npx prisma studio
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Projects

- `GET /projects` - List all projects
- `POST /projects` - Create new project
  ```json
  { "name": "Project Name" }
  ```

### Documents

- `GET /projects/:projectId/documents` - List documents in project
- `POST /projects/:projectId/documents` - Upload .docx file (multipart/form-data)
  - Field name: `file`
  - Max size: 10MB
- `GET /documents/:documentId/content` - Get document paragraphs

### Consistency Analysis

- `POST /projects/:projectId/consistency/run` - Trigger consistency check
- `GET /projects/:projectId/inconsistencies` - Get inconsistencies
  - Optional query param: `documentId`

## Database Schema

See `prisma/schema.prisma` for complete schema.

### Main Tables

- **projects**: Project metadata
- **documents**: Uploaded documents with status
- **document_paragraphs**: Extracted paragraphs with text/HTML
- **document_inconsistencies**: Detected inconsistencies with locations and details

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

Error responses:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Logging

Logs are written to:
- Console (formatted for development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Docker

Build:
```bash
docker build -t docalign-backend .
```

Run:
```bash
docker run -p 4000:4000 --env-file .env docalign-backend
```

Or use docker-compose from the project root.
