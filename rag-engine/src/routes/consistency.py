from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging

from src.clients.database import db_client
from src.clients.qdrant_client import qdrant_client
from src.embeddings.service import generate_embedding
from src.analysis.llm_service import analyze_paragraph_pair

logger = logging.getLogger(__name__)

router = APIRouter()


class AnalyzePairRequest(BaseModel):
    project_id: str
    doc1_id: str
    doc2_id: str
    top_k: int = 3  # Number of similar paragraphs to check per source paragraph


class InconsistencyResponse(BaseModel):
    source_document_id: str
    target_document_id: str
    source_paragraph_id: str
    target_paragraph_id: str
    source_excerpt: str
    target_excerpt: str
    source_location: Dict[str, int]
    target_location: Dict[str, int]
    inconsistency_type: str
    severity: str
    description: str
    explanation: str
    recommendation: str


class AnalyzePairResponse(BaseModel):
    success: bool
    message: str
    inconsistencies: List[InconsistencyResponse]


@router.post("/analyze-pair", response_model=AnalyzePairResponse)
async def analyze_pair(request: AnalyzePairRequest):
    """
    Analyze two documents for semantic inconsistencies.

    This endpoint:
    1. Fetches paragraphs from both documents
    2. For each paragraph in doc1, finds semantically similar paragraphs in doc2 using Qdrant
    3. Uses LLM to analyze each candidate pair for inconsistencies
    4. Returns list of detected inconsistencies
    """
    try:
        logger.info(f"Analyzing pair: {request.doc1_id} <-> {request.doc2_id}")

        # Fetch paragraphs for both documents
        doc1_paragraphs = db_client.fetch_document_paragraphs(request.doc1_id)
        doc2_paragraphs = db_client.fetch_document_paragraphs(request.doc2_id)

        if not doc1_paragraphs or not doc2_paragraphs:
            raise HTTPException(status_code=404, detail="One or both documents have no paragraphs")

        logger.info(f"Doc1: {len(doc1_paragraphs)} paragraphs, Doc2: {len(doc2_paragraphs)} paragraphs")

        inconsistencies = []

        # For each paragraph in doc1
        for doc1_para in doc1_paragraphs:
            # Get or generate embedding for this paragraph
            embedding = qdrant_client.get_embedding_by_id(doc1_para["id"])

            if not embedding:
                # Generate embedding if not found (fallback)
                embedding = generate_embedding(doc1_para["text"])

            # Find similar paragraphs in doc2
            similar_results = qdrant_client.query_similar_paragraphs(
                project_id=request.project_id,
                query_embedding=embedding,
                target_document_id=request.doc2_id,
                top_k=request.top_k
            )

            # Analyze each candidate pair with LLM
            for similar in similar_results:
                # Fetch the target paragraph details
                target_para = db_client.fetch_paragraph_by_id(similar["id"])

                if not target_para:
                    continue

                # Call LLM to analyze the pair
                result = analyze_paragraph_pair(
                    paragraph_a_text=doc1_para["text"],
                    paragraph_b_text=target_para["text"]
                )

                if result:
                    # Inconsistency detected
                    inconsistencies.append(
                        InconsistencyResponse(
                            source_document_id=request.doc1_id,
                            target_document_id=request.doc2_id,
                            source_paragraph_id=doc1_para["paragraph_id"],
                            target_paragraph_id=target_para["paragraph_id"],
                            source_excerpt=result["source_excerpt"],
                            target_excerpt=result["target_excerpt"],
                            source_location={
                                "paragraph_id": doc1_para["paragraph_id"],
                                "start_offset": result["source_location"]["start_offset"],
                                "end_offset": result["source_location"]["end_offset"]
                            },
                            target_location={
                                "paragraph_id": target_para["paragraph_id"],
                                "start_offset": result["target_location"]["start_offset"],
                                "end_offset": result["target_location"]["end_offset"]
                            },
                            inconsistency_type=result["inconsistency_type"],
                            severity=result["severity"],
                            description=result["description"],
                            explanation=result["explanation"],
                            recommendation=result["recommendation"]
                        )
                    )

        logger.info(f"Found {len(inconsistencies)} inconsistencies")

        return AnalyzePairResponse(
            success=True,
            message=f"Analysis complete. Found {len(inconsistencies)} inconsistencies.",
            inconsistencies=inconsistencies
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to analyze document pair: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
