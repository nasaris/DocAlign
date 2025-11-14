# DocAlign RAG-Engine

Python + FastAPI service for semantic document analysis using embeddings and LLM.

## Features

- **Embedding Generation**: OpenAI text-embedding-3-small (abstracted for easy swapping)
- **Vector Storage**: Qdrant for fast semantic similarity search
- **LLM Analysis**: GPT-4 for inconsistency detection with structured JSON responses
- **No Rule Engine**: All semantic decisions delegated to LLM

## Tech Stack

- Python 3.11
- FastAPI
- Qdrant (vector database)
- OpenAI API (embeddings + GPT-4)
- PostgreSQL (via psycopg2)

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL database
- Qdrant running
- OpenAI API key

### Installation

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
OPENAI_API_KEY=sk-your-api-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/docalign
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=paragraph_embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
LLM_MODEL=gpt-4
```

### Development

```bash
uvicorn src.main:app --reload --port 8000
```

### Production

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check

- `GET /health` - Service health and configuration

### Embeddings

- `POST /embeddings/ingest-document`
  ```json
  {
    "project_id": "uuid",
    "document_id": "uuid"
  }
  ```
  - Fetches paragraphs from PostgreSQL
  - Generates embeddings via OpenAI
  - Stores in Qdrant with metadata

### Consistency Analysis

- `POST /consistency/analyze-pair`
  ```json
  {
    "project_id": "uuid",
    "doc1_id": "uuid",
    "doc2_id": "uuid",
    "top_k": 3
  }
  ```
  - Finds semantically similar paragraph pairs using Qdrant
  - Analyzes each pair with LLM
  - Returns detected inconsistencies

## Architecture

### Abstracted Embedding Service

The embedding generation is abstracted in `src/embeddings/service.py`:

```python
def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for text.
    Currently uses OpenAI, but can be swapped for local models.
    """
```

This makes it easy to switch to:
- Local models (sentence-transformers, etc.)
- Other API providers
- Custom embedding solutions

### LLM-Based Inconsistency Detection

All semantic analysis is performed by the LLM (`src/analysis/llm_service.py`):

- No hand-crafted rules
- Structured JSON responses
- Clear prompt engineering
- Inconsistency types: CONTRADICTION, MISSING_REQUIREMENT, CONFLICTING_DEFINITION, INCONSISTENT_SCOPE, DATA_MISMATCH
- Severity levels: CRITICAL, HIGH, MEDIUM, LOW

### Qdrant Collection

Collection: `paragraph_embeddings`
- Vector size: 1536 (text-embedding-3-small)
- Distance metric: COSINE
- Metadata: project_id, document_id, paragraph_id, paragraph_index

## Project Structure

```
rag-engine/
├── src/
│   ├── main.py                    # FastAPI app
│   ├── config.py                  # Settings
│   ├── routes/
│   │   ├── embeddings.py         # Embedding endpoints
│   │   └── consistency.py        # Analysis endpoints
│   ├── embeddings/
│   │   └── service.py            # Abstracted embedding generation
│   ├── analysis/
│   │   └── llm_service.py        # LLM-based inconsistency detection
│   └── clients/
│       ├── database.py           # PostgreSQL client
│       └── qdrant_client.py      # Qdrant client wrapper
├── requirements.txt
├── Dockerfile
└── README.md
```

## Docker

Build:
```bash
docker build -t docalign-rag-engine .
```

Run:
```bash
docker run -p 8000:8000 --env-file .env docalign-rag-engine
```

Or use docker-compose from the project root.

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

Error responses:
```json
{
  "detail": "Error description"
}
```

## Logging

Logs include:
- Document ingestion progress
- Embedding generation metrics
- Similarity search results
- LLM analysis outcomes
- Error traces

## Performance Considerations

- **Batch Embeddings**: Uses `generate_embeddings_batch()` for efficiency
- **Top-K Search**: Configurable `top_k` parameter (default: 3)
- **Async Operations**: FastAPI async endpoints
- **Connection Pooling**: PostgreSQL connection management

## Future Enhancements

- Local embedding models (sentence-transformers)
- Caching layer for embeddings
- Batch analysis endpoints
- Progress tracking for long-running analyses
- Alternative LLM providers
