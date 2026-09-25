# BÁO CÁO ASSIGNMENT 03: REACTJS FRONTEND DEVELOPMENT

## 1. Tổng Quan Dự Án
Ứng dụng giao diện quản lý người dùng (**User Management Application**) được xây dựng bằng **React 18** và **Vite**, tích hợp trọn vẹn với RESTful API backend (FastAPI).

### Công Nghệ & Tiêu Chuẩn:
- **Build Tool & Framework**: Vite 5 + React 18
- **HTTP Client**: Axios với Interceptor tập trung
- **Testing**: Vitest + @testing-library/react (16 unit tests, 100% passed)
- **Code Standards**: ESLint (`.eslintrc.cjs`) & Prettier (`.prettierrc`)
- **Kiến trúc UI**: Responsive Glassmorphism Design, Dark/Light Mode hỗ trợ cả chế độ xem dạng Bảng (Table) và dạng Thẻ (Grid Cards).

---

## 2. Cấu Trúc Thư Mục & Vai Trò Các Component

```
frontend/
├── .env.example              # Cấu hình biến môi trường mẫu
├── .eslintrc.cjs             # Quy chuẩn ESLint
├── .prettierrc               # Quy chuẩn định dạng Prettier
├── index.html                # Single Page HTML entry
├── package.json              # Scripts & dependencies
├── vite.config.js            # Cấu hình Vite & cấu hình test Vitest
└── src/
    ├── api/
    │   └── userApi.js        # Axios client độc lập, tích hợp các API CRUD
    ├── components/
    │   ├── Pagination.jsx    # Component phân trang (phân chia trang, kích thước trang)
    │   ├── SearchBar.jsx     # Component tìm kiếm người dùng theo tên hoặc email
    │   ├── UserForm.jsx      # Form thêm mới / cập nhật người dùng (validate, loading, reset)
    │   ├── UserList.jsx      # Giao diện danh sách user dạng Card Grid
    │   ├── UserTable.jsx     # Giao diện danh sách user dạng Table chuyên nghiệp
    │   ├── UserForm.test.jsx # Unit tests cho UserForm
    │   ├── UserList.test.jsx # Unit tests cho UserList
    │   └── UserTable.test.jsx# Unit tests cho UserTable
    ├── pages/
    │   └── UsersPage.jsx     # Trang quản lý người dùng chính (quản lý state tổng thể)
    ├── App.jsx               # Root layout, Header & Navigation
    ├── App.test.jsx          # Unit test render root App
    ├── index.css             # Hệ thống CSS Design System hoàn chỉnh
    ├── main.jsx              # React DOM entry point
    ├── setupTests.js         # Jest-DOM matchers cho Vitest
    ├── utils.js              # Tiện ích helper (tạo avatar viết tắt, ...)
    └── utils.test.js         # Unit tests cho utils
```

### Giải Thích Trách Nhiệm Từng Thành Phần:
1. **`src/api/userApi.js`**:
   - Tách biệt hoàn toàn tầng kết nối HTTP khỏi UI components.
   - Nhận biến `VITE_API_URL` từ file `.env` (mặc định fallback `http://localhost:8000`).
   - Sử dụng `axios.interceptors.response` để bắt và chuẩn hóa các thông điệp lỗi từ backend trả về.
2. **`src/pages/UsersPage.jsx`**:
   - Đóng vai trò Container Component (Smart Component).
   - Quản lý toàn bộ State: danh sách users, loading, error, success notification, search query, trang hiện tại, user đang được chỉnh sửa, và chế độ hiển thị (Table hoặc Card).
3. **`src/components/UserForm.jsx`**:
   - Presentational/Form Component.
   - Kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation): tên không được để trống, email đúng định dạng regex.
   - Hỗ trợ cả 2 chế độ: "Thêm mới người dùng" và "Cập nhật thông tin".
   - Tự động reset form và focus lại input sau khi hoàn tất.
4. **`src/components/UserTable.jsx` & `UserList.jsx`**:
   - Hiển thị danh sách thông tin cơ bản: ID, Avatar, Tên, Email.
   - Hiển thị Empty State khi không có dữ liệu phù hợp.
   - Cung cấp nút thao tác: Sửa (Edit) và Xoá (Delete) kèm xác nhận an toàn (Confirm Dialog).
5. **`src/components/SearchBar.jsx` & `Pagination.jsx`**:
   - Cho phép lọc tức thời theo Tên hoặc Email.
   - Phân chia danh sách thành từng trang nhỏ (mặc định 5 users/trang), tránh vỡ layout khi dữ liệu lớn.

---

## 3. Luồng Tích Hợp API (API Integration Flow)

### Sơ Đồ Quy Trình Tương Tác:

```
[UI Component / Event]
        │
        ▼ (Gọi hàm)
[src/pages/UsersPage.jsx]
        │
        ▼ (Truyền payload)
[src/api/userApi.js] ── (Axios Instance với baseURL từ VITE_API_URL)
        │
        ▼ (HTTP Request)
[FastAPI Backend: /users]
        │
        ▼ (Database PostgreSQL/SQLite)
[FastAPI Response / Status Code]
        │
        ▼
[Axios Response Interceptor] ── (Bắt lỗi nếu có, trích xuất error.response.data.detail)
        │
        ▼
[UsersPage State Update]
 ├── Thành công: Cập nhật danh sách users, hiển thị Toast Success, Reset form
 └── Thất bại: Giữ nguyên dữ liệu, hiển thị Toast Error / Alert chi tiết
```

### Chi Tiết Các Endpoints Tích Hợp:

| Thao Tác | HTTP Method | Endpoint | Hàm trong `userApi.js` | Xử Lý Phản Hồi |
| :--- | :--- | :--- | :--- | :--- |
| **Lấy danh sách** | `GET` | `/users` | `getUsers()` | Nạp vào state `users`, tắt loading spinner |
| **Xem chi tiết** | `GET` | `/users/{id}` | `getUserById(id)` | Lấy thông tin user phục vụ chỉnh sửa |
| **Thêm mới user** | `POST` | `/users` | `createUser(payload)` | Nhận user mới tạo (201), thêm vào list, reset form |
| **Cập nhật user** | `PUT` | `/users/{id}` | `updateUser(id, payload)` | Cập nhật user trong state, thoát mode edit |
| **Xoá user** | `DELETE` | `/users/{id}` | `deleteUser(id)` | Hiển thị confirm pop-up, gọi API, lọc bỏ khỏi state |

---

## 4. State Management & Trải Nghiệm Người Dùng (UX)

- **Loading State**: Hiển thị spinner và lớp phủ làm mờ nội dung trong suốt quá trình gọi API, ngăn ngừa hành động nhấn đúp.
- **Feedback Thông Báo**: Toast notification tự động xuất hiện góc trên bên phải khi tạo, cập nhật, xoá thành công hoặc khi xảy ra lỗi mạng.
- **Validation Phía Client**: Ngăn chặn gửi request không hợp lệ ngay tại form:
  - Tên rỗng $\rightarrow$ báo lỗi "Vui lòng nhập họ và tên".
  - Email sai định dạng $\rightarrow$ báo lỗi "Email không hợp lệ (ví dụ: user@example.com)".
- **Confirm Action**: Khi người dùng nhấn nút "Xoá", trình duyệt hiển thị hộp thoại xác nhận `window.confirm` để tránh xoá nhầm dữ liệu quan trọng.

---

## 5. Kết Quả Kiểm Thử (Unit Testing)

Chạy kiểm thử tự động với Vitest:
```bash
npm test
```

### Kết Quả Đạt Được:
- **5 Test Suites**:
  - `src/utils.test.js`: Kiểm tra hàm format avatar initials.
  - `src/App.test.jsx`: Kiểm tra render layout và tiêu đề chính.
  - `src/components/UserTable.test.jsx`: Kiểm tra hiển thị bảng, empty state, sự kiện click Edit/Delete.
  - `src/components/UserList.test.jsx`: Kiểm tra hiển thị danh thiếp (cards), empty state, click sự kiện.
  - `src/components/UserForm.test.jsx`: Kiểm tra validation, submit thêm mới, fill dữ liệu khi update.
- **Tổng số tests**: **16/16 tests PASSED (100%)**.
- **Code Coverage**: Đầy đủ báo cáo LCOV và Cobertura phục vụ hiển thị trên GitLab CI và SonarCloud.
