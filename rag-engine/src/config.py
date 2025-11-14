from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str

    # Database
    database_url: str

    # Qdrant
    qdrant_url: str = "http://qdrant:6333"
    qdrant_collection_name: str = "paragraph_embeddings"

    # Models
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536
    llm_model: str = "gpt-4"

    # Server
    port: int = 8000
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
