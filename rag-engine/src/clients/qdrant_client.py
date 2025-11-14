from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from typing import List, Dict, Any
import logging

from src.config import settings

logger = logging.getLogger(__name__)


class QdrantClientWrapper:
    def __init__(self):
        self.client = QdrantClient(url=settings.qdrant_url)
        self.collection_name = settings.qdrant_collection_name
        self.vector_size = settings.embedding_dimension

    async def init_collection(self):
        """Initialize Qdrant collection if it doesn't exist"""
        collections = self.client.get_collections().collections
        collection_names = [c.name for c in collections]

        if self.collection_name not in collection_names:
            logger.info(f"Creating Qdrant collection: {self.collection_name}")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE
                )
            )
            logger.info(f"Collection {self.collection_name} created successfully")
        else:
            logger.info(f"Collection {self.collection_name} already exists")

    def upsert_paragraph_embedding(
        self,
        paragraph_db_id: str,
        project_id: str,
        document_id: str,
        paragraph_id: str,
        paragraph_index: int,
        embedding: List[float]
    ):
        """Insert or update a paragraph embedding"""
        point = PointStruct(
            id=paragraph_db_id,
            vector=embedding,
            payload={
                "project_id": project_id,
                "document_id": document_id,
                "paragraph_id": paragraph_id,
                "paragraph_index": paragraph_index
            }
        )

        self.client.upsert(
            collection_name=self.collection_name,
            points=[point]
        )

    def query_similar_paragraphs(
        self,
        project_id: str,
        query_embedding: List[float],
        target_document_id: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Find similar paragraphs in a specific document"""
        # Filter by project_id and target_document_id
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="project_id",
                    match=MatchValue(value=project_id)
                ),
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=target_document_id)
                )
            ]
        )

        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            query_filter=query_filter,
            limit=top_k
        )

        return [
            {
                "id": result.id,
                "score": result.score,
                "payload": result.payload
            }
            for result in results
        ]

    def get_embedding_by_id(self, paragraph_db_id: str) -> List[float]:
        """Retrieve the embedding vector for a paragraph"""
        results = self.client.retrieve(
            collection_name=self.collection_name,
            ids=[paragraph_db_id],
            with_vectors=True
        )

        if results:
            return results[0].vector
        return None


# Singleton instance
qdrant_client = QdrantClientWrapper()


async def init_qdrant_collection():
    """Initialize Qdrant collection (called on startup)"""
    await qdrant_client.init_collection()
