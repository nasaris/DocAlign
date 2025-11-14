from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

from src.clients.database import db_client
from src.clients.qdrant_client import qdrant_client
from src.embeddings.service import generate_embedding, generate_embeddings_batch

logger = logging.getLogger(__name__)

router = APIRouter()


class IngestDocumentRequest(BaseModel):
    project_id: str
    document_id: str


class IngestDocumentResponse(BaseModel):
    success: bool
    message: str
    paragraphs_processed: int


@router.post("/ingest-document", response_model=IngestDocumentResponse)
async def ingest_document(request: IngestDocumentRequest):
    """
    Ingest a document: fetch paragraphs, generate embeddings, store in Qdrant.

    This endpoint:
    1. Fetches all paragraphs for the document from PostgreSQL
    2. Generates embeddings for each paragraph using OpenAI
    3. Stores embeddings in Qdrant with metadata
    """
    try:
        logger.info(f"Ingesting document {request.document_id} for project {request.project_id}")

        # Fetch paragraphs from database
        paragraphs = db_client.fetch_document_paragraphs(request.document_id)

        if not paragraphs:
            raise HTTPException(status_code=404, detail="No paragraphs found for document")

        logger.info(f"Found {len(paragraphs)} paragraphs")

        # Generate embeddings (batch processing for efficiency)
        texts = [p["text"] for p in paragraphs]
        embeddings = generate_embeddings_batch(texts)

        # Store embeddings in Qdrant
        for paragraph, embedding in zip(paragraphs, embeddings):
            qdrant_client.upsert_paragraph_embedding(
                paragraph_db_id=paragraph["id"],
                project_id=request.project_id,
                document_id=request.document_id,
                paragraph_id=paragraph["paragraph_id"],
                paragraph_index=paragraph["index"],
                embedding=embedding
            )

        logger.info(f"Successfully ingested {len(paragraphs)} paragraphs")

        return IngestDocumentResponse(
            success=True,
            message=f"Successfully ingested {len(paragraphs)} paragraphs",
            paragraphs_processed=len(paragraphs)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to ingest document: {e}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
