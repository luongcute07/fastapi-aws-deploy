# Final DevOps – CI/CD Pipeline với SonarQube

Dự án **User Management System** hoàn chỉnh với GitLab CI/CD pipeline và SonarQube analysis.

---

## 📁 Cấu trúc dự án

```
final-devops/
├── .gitlab-ci.yml          # Pipeline: lint → test → sonarqube → build → docker → deploy → notify
├── sonar-project.properties # SonarQube config
├── docker-compose.yml      # App stack + SonarQube (optional profile)
├── .gitignore
├── backend/                # FastAPI + PostgreSQL
│   ├── Dockerfile
│   ├── requirements.txt    # Bao gồm pytest-cov
│   ├── .env / .env.example
│   ├── .dockerignore
│   └── app/
│       ├── __init__.py
│       ├── main.py         # FastAPI app + CORS + CRUD endpoints
│       ├── models.py       # SQLAlchemy User model
│       ├── schemas.py      # Pydantic schemas
│       └── database.py     # DB engine + session
│   └── tests/
│       └── test_main.py    # 10 tests covering all CRUD + health
└── frontend/               # React 18 + Vite
    ├── Dockerfile          # Multi-stage: Node build → Nginx serve
    ├── nginx.conf
    ├── package.json        # Bao gồm test:coverage script
    ├── vite.config.js      # Coverage: lcov + cobertura cho SonarQube
    ├── .eslintrc.cjs
    ├── .prettierrc
    ├── index.html
    └── src/
        ├── App.jsx / App.test.jsx
        ├── main.jsx
        ├── index.css       # Dark mode + Glassmorphism
        ├── utils.js / utils.test.js
        ├── setupTests.js
        ├── api/
        │   ├── userApi.js  # Axios client + interceptor
        │   └── users.js    # Re-export
        ├── components/
        │   ├── UserForm.jsx + UserForm.test.jsx
        │   ├── UserTable.jsx + UserTable.test.jsx
        │   ├── UserList.jsx
        │   ├── SearchBar.jsx
        │   └── Pagination.jsx
        └── pages/
            └── UsersPage.jsx
```

---

## 🚀 Chạy nhanh (Development)

```bash
# 1. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Chạy toàn bộ stack
docker compose up -d

# → Frontend: http://localhost:3000
# → Backend API: http://localhost:8000
# → API Docs: http://localhost:8000/docs
```

### Chạy SonarQube local (optional)

```bash
docker compose --profile sonar up -d
# → SonarQube UI: http://localhost:9000
# Login: admin / admin
```

---

## 🧪 Chạy Tests

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v --cov=app --cov-report=xml:coverage.xml
```

### Frontend

```bash
cd frontend
npm install
npm run test          # Run tests
npm run test:coverage # Run với coverage report (cho SonarQube)
npm run lint          # ESLint check
npm run build         # Production build
```

---

## 🔧 GitLab CI/CD – Biến cần khai báo

Vào **Settings > CI/CD > Variables** và thêm:

| Variable | Mô tả |
|---|---|
| `SONAR_HOST_URL` | URL của SonarQube server (vd: `http://192.168.1.x:9000`) |
| `SONAR_TOKEN` | Token từ SonarQube (User > My Account > Security) |
| `SSH_PRIVATE_KEY` | Private key để SSH vào server deploy |
| `DEPLOY_USER` | Username SSH trên server (vd: `ubuntu`) |
| `DEPLOY_HOST` | IP/hostname của server (vd: `192.168.1.100`) |
| `SLACK_WEBHOOK_URL` | Webhook URL để gửi notification khi pipeline fail |

---

## 📊 Pipeline Stages

```
lint ──→ test ──→ sonarqube ──→ build ──→ docker ──→ deploy (manual) ──→ notify (on_failure)
```

| Stage | Jobs | Chạy khi |
|---|---|---|
| **lint** | `frontend-lint` | Mọi branch |
| **test** | `frontend-test`, `backend-test` | Mọi branch, sinh coverage XML |
| **sonarqube** | `sonarqube-analysis` | Chỉ `main` & `develop` |
| **build** | `frontend-build` | Mọi branch |
| **docker** | `docker-build-frontend`, `docker-build-backend` | Chỉ `main` & `develop` |
| **deploy** | `deploy-staging` | Chỉ `main`, **manual approval** |
| **notify** | `notify-failure` | Khi pipeline thất bại |

---

## 🔑 Điểm cần nhớ cho thi

1. **SonarQube flow**: Code → Test + Coverage XML → sonar-scanner upload → Quality Gate
2. **`sonar-project.properties`** – config SonarQube project (projectKey, sources, coverage paths)
3. **Coverage cho SonarQube**:
   - Python: `pytest --cov=app --cov-report=xml:coverage.xml`
   - JS: `vitest run --coverage` → sinh `lcov.info` và `cobertura-coverage.xml`
4. **Docker Registry**: Dùng `$CI_REGISTRY_IMAGE` (GitLab Container Registry có sẵn)
5. **Manual deploy**: `when: manual` trong rules của job `deploy-staging`
6. **Notify on failure**: `when: on_failure` – không cần `rules`
7. **YAML Anchors**: `&docker-build-template` và `<<: *docker-build-template`

---

## 🐳 API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/users` | Lấy danh sách users |
| POST | `/users` | Tạo user mới |
| GET | `/users/{id}` | Lấy user theo ID |
| PUT | `/users/{id}` | Cập nhật user |
| DELETE | `/users/{id}` | Xoá user |
