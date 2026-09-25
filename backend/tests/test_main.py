import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# ── In-memory SQLite DB for testing ─────────────────────────
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


# ─── Health Tests ────────────────────────────────────────────

def test_health_check():
    """Health endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root():
    """Root endpoint returns running message."""
    response = client.get("/")
    assert response.status_code == 200
    assert "running" in response.json()["message"]


# ─── User CRUD Tests ─────────────────────────────────────────

def test_get_users_empty():
    """GET /users returns empty list initially."""
    response = client.get("/users")
    assert response.status_code == 200
    assert response.json() == []


def test_create_user():
    """POST /users creates a user and returns 201."""
    payload = {"name": "Nguyen Van A", "email": "vana@example.com"}
    response = client.post("/users", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Nguyen Van A"
    assert data["email"] == "vana@example.com"
    assert "id" in data


def test_create_user_duplicate_email():
    """POST /users with duplicate email returns 400."""
    payload = {"name": "User One", "email": "dup@example.com"}
    client.post("/users", json=payload)
    response = client.post("/users", json=payload)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_get_user_by_id():
    """GET /users/{id} returns the created user."""
    created = client.post("/users", json={"name": "Tran B", "email": "tranb@example.com"})
    user_id = created.json()["id"]

    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["id"] == user_id


def test_get_user_not_found():
    """GET /users/999 returns 404."""
    response = client.get("/users/999")
    assert response.status_code == 404


def test_update_user():
    """PUT /users/{id} updates the user successfully."""
    created = client.post("/users", json={"name": "Le C", "email": "lec@example.com"})
    user_id = created.json()["id"]

    update_payload = {"name": "Le C Updated", "email": "lec_updated@example.com"}
    response = client.put(f"/users/{user_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["name"] == "Le C Updated"


def test_update_user_not_found():
    """PUT /users/999 returns 404."""
    response = client.put("/users/999", json={"name": "Ghost"})
    assert response.status_code == 404


def test_delete_user():
    """DELETE /users/{id} removes the user."""
    created = client.post("/users", json={"name": "Pham D", "email": "phamd@example.com"})
    user_id = created.json()["id"]

    response = client.delete(f"/users/{user_id}")
    assert response.status_code == 200

    # Verify deleted
    get_response = client.get(f"/users/{user_id}")
    assert get_response.status_code == 404


def test_delete_user_not_found():
    """DELETE /users/999 returns 404."""
    response = client.delete("/users/999")
    assert response.status_code == 404
