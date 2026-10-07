"""
Database configuration and session management.
Re-exports symbols from db.py for full backward compatibility.
"""
from .db import DATABASE_URL, engine, SessionLocal, Base, get_db

__all__ = ["DATABASE_URL", "engine", "SessionLocal", "Base", "get_db"]
