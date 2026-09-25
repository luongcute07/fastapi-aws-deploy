# ── Base image ──────────────────────────────────────────────
FROM python:3.11-slim

# ── Working directory ────────────────────────────────────────
WORKDIR /app

# ── Install dependencies first (layer cache) ─────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy application source ───────────────────────────────────
COPY app ./app

# ── Expose port ───────────────────────────────────────────────
EXPOSE 8000

# ── Run FastAPI with uvicorn ──────────────────────────────────
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
