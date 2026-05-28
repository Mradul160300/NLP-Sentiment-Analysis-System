from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.services.sentiment import load_model
from app.routes import upload, analysis, results, single
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialize DB and load ML model."""
    logger.info("Starting up — initializing database...")
    await init_db()
    logger.info("Database ready.")

    logger.info("Loading sentiment model (this may take a moment on first run)...")
    load_model()
    logger.info("Sentiment model loaded.")

    yield  # app is running

    logger.info("Shutting down.")


app = FastAPI(
    title="Sentiment Analysis API",
    description="Production-quality sentiment analysis with DistilBERT and emoji-aware scoring.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.56.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(upload.router, tags=["Upload"])
app.include_router(single.router, tags=["Single Analysis"])
app.include_router(analysis.router, tags=["Analysis"])
app.include_router(results.router, tags=["Results"])


@app.get("/health")
async def health():
    return {"status": "ok"}
