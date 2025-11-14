from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from src.config import settings
from src.routes import embeddings, consistency
from src.clients.qdrant_client import init_qdrant_collection

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI application"""
    # Startup
    logger.info("Starting RAG-Engine...")

    # Initialize Qdrant collection
    try:
        await init_qdrant_collection()
        logger.info("Qdrant collection initialized")
    except Exception as e:
        logger.error(f"Failed to initialize Qdrant collection: {e}")

    yield

    # Shutdown
    logger.info("Shutting down RAG-Engine...")


app = FastAPI(
    title="DocAlign RAG-Engine",
    description="Semantic document analysis with embeddings and LLM",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "rag-engine",
        "embedding_model": settings.embedding_model,
        "llm_model": settings.llm_model
    }

# Include routers
app.include_router(embeddings.router, prefix="/embeddings", tags=["Embeddings"])
app.include_router(consistency.router, prefix="/consistency", tags=["Consistency"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)
