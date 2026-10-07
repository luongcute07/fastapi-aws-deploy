"""
Entrypoint for FastAPI application.
Re-exports FastAPI app instance for 'uvicorn main:app'.
"""
from app.main import app

__all__ = ["app"]
