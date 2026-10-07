"""
Entrypoint for FastAPI application.
Re-exports FastAPI app instance for 'uvicorn main:app'.
"""
try:
    from backend.app.main import app
except ImportError:
    from app.main import app

__all__ = ["app"]
