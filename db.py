"""
Root db.py re-export for root-level execution.
"""
try:
    from backend.app.db import *
except ImportError:
    from app.db import *
