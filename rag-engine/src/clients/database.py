import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any
import logging

from src.config import settings

logger = logging.getLogger(__name__)


class DatabaseClient:
    def __init__(self):
        self.connection_string = settings.database_url

    def get_connection(self):
        """Get a new database connection"""
        return psycopg2.connect(self.connection_string, cursor_factory=RealDictCursor)

    def fetch_document_paragraphs(self, document_id: str) -> List[Dict[str, Any]]:
        """Fetch all paragraphs for a document"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, document_id, index, paragraph_id, text
                    FROM document_paragraphs
                    WHERE document_id = %s
                    ORDER BY index ASC
                    """,
                    (document_id,)
                )
                results = cur.fetchall()
                return [dict(row) for row in results]

    def fetch_paragraph_by_id(self, paragraph_db_id: str) -> Dict[str, Any]:
        """Fetch a single paragraph by its database ID"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, document_id, index, paragraph_id, text
                    FROM document_paragraphs
                    WHERE id = %s
                    """,
                    (paragraph_db_id,)
                )
                result = cur.fetchone()
                return dict(result) if result else None

    def fetch_paragraph_by_paragraph_id(
        self, document_id: str, paragraph_id: str
    ) -> Dict[str, Any]:
        """Fetch a paragraph by document_id and paragraph_id (e.g., 'p-0')"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, document_id, index, paragraph_id, text
                    FROM document_paragraphs
                    WHERE document_id = %s AND paragraph_id = %s
                    """,
                    (document_id, paragraph_id)
                )
                result = cur.fetchone()
                return dict(result) if result else None


# Singleton instance
db_client = DatabaseClient()
