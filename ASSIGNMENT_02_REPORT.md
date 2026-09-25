# BÁO CÁO ASSIGNMENT 02: CI/CD VỚI GITLAB CI/CD

## 1. Tổng Quan Kiến Trúc Pipeline
Pipeline CI/CD được xây dựng trên GitLab CI/CD để tự động hóa toàn bộ quy trình:
- **Linting & Code Quality**: Kiểm tra cú pháp và định dạng mã nguồn (ESLint & Prettier).
- **Automated Testing & Coverage**: Chạy Unit Test cho cả Frontend (Vitest) và Backend (Pytest) sinh báo cáo Cobertura coverage.
- **Static Code Analysis**: Tích hợp SonarQube / SonarCloud phân tích chất lượng mã nguồn, phát hiện code smells, bảo mật và bugs.
- **Build**: Biên dịch React Vite app tạo ra production static artifact (`dist/`).
- **Docker Packaging**: Đóng gói multi-stage Docker images cho Backend và Frontend, gắn tag commit SHA và latest, sau đó đẩy lên GitLab Container Registry.
- **Deployment & Notification**: Hỗ trợ manual trigger deploy môi trường Staging bằng Docker Compose và gửi thông báo khi pipeline gặp lỗi.

---

## 2. Cấu Trúc Các Stages trong `.gitlab-ci.yml`

Quy trình pipeline gồm 7 stages tuần tự:
```yaml
stages:
  - lint
  - test
  - sonarqube
  - build
  - docker
  - deploy
  - notify
```

### Stage 1: Lint (`frontend-lint`)
- **Image**: `node:20-alpine`
- **Mục tiêu**: Đảm bảo toàn bộ mã nguồn tuân thủ tiêu chuẩn coding convention của dự án.
- **Thực thi**:
  - `npm install --no-audit --prefer-offline`
  - `npm run lint` (ESLint cấu hình nghiêm ngặt với `--max-warnings 0`)
  - `npm run format:check` (Prettier kiểm tra format)
- **Quyết định thiết kế**: Tách riêng stage lint giúp phát hiện sớm các lỗi cú pháp ngay ở giây thứ 20, giảm thiểu thời gian chờ đợi và tiết kiệm tài nguyên runner.

### Stage 2: Test (`frontend-test` & `backend-test`)
- **Frontend Test**:
  - Chạy `vitest run --coverage`
  - Xuất báo cáo `coverage/cobertura-coverage.xml`
  - GitLab tích hợp hiển thị tỷ lệ Code Coverage trực tiếp trên Merge Requests và Pipeline widget thông qua regex: `/All files[^|]*\|[^|]*\s+([\d\.]+)/`.
- **Backend Test**:
  - **Image**: `python:3.11-slim`
  - Cài đặt `pytest`, `pytest-cov`, `httpx`, `fastapi`, `sqlalchemy`
  - Chạy `pytest --cov=app --cov-report=xml:coverage.xml --cov-report=term`
  - **Quyết định thiết kế**: Sử dụng biến môi trường `DATABASE_URL: sqlite:///./test.db` để test độc lập in-memory, không phụ thuộc vào database bên ngoài, giúp job chạy cực nhanh (< 30s) và ổn định tuyệt đối.

### Stage 3: SonarQube Analysis (`sonarqube-analysis`)
- **Image**: `sonarsource/sonar-scanner-cli:latest`
- **Tập tin cấu hình**: `sonar-project.properties`
- **Phân tích tích hợp**:
  - Gom báo cáo kiểm thử của Frontend (`lcov.info`) và Backend (`coverage.xml`) từ stage test thông qua cơ chế `needs: [frontend-test, backend-test]`.
  - Phân tích code smells, security hotspots, bugs và độ phủ mã nguồn.
  - Sử dụng biến bảo mật `${SONAR_HOST_URL}`, `${SONAR_TOKEN}`, `${SONAR_ORGANIZATION}` từ GitLab CI/CD Variables.

### Stage 4: Build (`frontend-build`)
- **Image**: `node:20-alpine`
- **Mục tiêu**: Đóng gói ứng dụng React Vite thành các tệp tĩnh tối ưu (HTML/CSS/JS minified).
- **Thực thi**: `npm run build`
- **Artifacts**:
  - Lưu trữ thư mục `frontend/dist/`
  - Thiết lập `expire_in: 1 week` phục vụ việc tải trực tiếp hoặc chuyển tiếp cho các stage sau.

### Stage 5: Docker Build & Push (`docker-build-frontend` & `docker-build-backend`)
- **Image**: `docker:24.0.5` với service `docker:24.0.5-dind`
- **Quy tắc kích hoạt (Rules)**: Chỉ build và push khi commit vào nhánh `main` hoặc `develop` (hoặc git tags).
- **Bảo mật**:
  - Xác thực registry bằng biến dựng sẵn an toàn của GitLab:
    ```bash
    echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin $CI_REGISTRY
    ```
  - Tuyệt đối không hardcode mật khẩu, token vào mã nguồn.
- **Gắn Tag**:
  - Tag theo commit SHA: `$CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA`
  - Tag phiên bản mới nhất: `$CI_REGISTRY_IMAGE/frontend:latest`
  - Đảm bảo tính truy xuất nguồn gốc (traceability) cho từng lần release.

### Stage 6: Deploy (`deploy-staging`) - Bonus 2.2
- **Cơ chế**: `when: manual`
- Triển khai ứng dụng bằng `docker-compose.yml`, cập nhật image tags mới nhất từ GitLab Container Registry.

### Stage 7: Notification (`notify-failure`) - Bonus 2.3
- **Cơ chế**: `when: on_failure`
- Tự động kích hoạt khi có bất kỳ job nào trong pipeline bị fail.
- Gửi webhook thông báo tới Slack / Teams / Discord kèm thông tin Commit, Author, Branch và URL dẫn trực tiếp tới Job bị lỗi.

---

## 3. Caching & Tối Ưu Hiệu Năng Pipeline

| Mục Tiêu | Cơ Chế Cấu Hình | Hiệu Quả |
| :--- | :--- | :--- |
| **Node.js dependencies** | `cache.paths: [frontend/node_modules/]` kèm `key: ${CI_COMMIT_REF_SLUG}-npm` | Giảm 60% thời gian chạy job frontend (từ ~60s xuống ~20s) |
| **Python pip cache** | `cache.paths: [.cache/pip]` kèm `PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"` | Tránh tải lại các wheel packages |
| **Job Dependencies (`needs`)** | Sử dụng DAG (`needs`) thay vì chờ đợi toàn bộ stage trước | `docker-build-frontend` chạy ngay khi `frontend-build` xong mà không cần chờ backend |

---

## 4. Bằng Chứng Thực Nghiệm & Artifacts

- **GitLab Repository**: `https://gitlab.com/freelance-group9132339/devops-final`
- **Pipeline ID Thành Công**: `#2881087324`
- **Trạng thái**: Tất cả các job tự động đều đạt trạng thái `passed` (Xanh lá 100%).
- **GitLab Container Registry**:
  - Backend: `registry.gitlab.com/freelance-group9132339/devops-final/backend`
  - Frontend: `registry.gitlab.com/freelance-group9132339/devops-final/frontend`
  - Các Tags: `70a7ac59bdce69932c440ac0ee33309970a3b9f7`, `latest`
- **SonarCloud Project**: `https://sonarcloud.io/project/overview?id=devops-final` (Organization: `luongthaydoi07`)
- **Frontend Build Artifact**: Có sẵn trong job `frontend-build` (`#16726047467`), thư mục `frontend/dist/`.
