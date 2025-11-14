from openai import OpenAI
from typing import List
import logging

from src.config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.openai_api_key)


def generate_embedding(text: str) -> List[float]:
    """
    Generate a single embedding vector for the given text.

    This function is abstracted to allow easy swapping of embedding providers
    in the future (e.g., local models, other APIs).

    Args:
        text: The text to embed

    Returns:
        A list of floats representing the embedding vector
    """
    try:
        response = client.embeddings.create(
            model=settings.embedding_model,
            input=text
        )
        embedding = response.data[0].embedding
        logger.debug(f"Generated embedding for text (length: {len(text)})")
        return embedding
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        raise


def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in a single API call.
    More efficient for batch processing.

    Args:
        texts: List of texts to embed

    Returns:
        List of embedding vectors
    """
    try:
        response = client.embeddings.create(
            model=settings.embedding_model,
            input=texts
        )
        embeddings = [item.embedding for item in response.data]
        logger.info(f"Generated {len(embeddings)} embeddings in batch")
        return embeddings
    except Exception as e:
        logger.error(f"Failed to generate batch embeddings: {e}")
        raise
