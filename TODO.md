# TODO - PKS Course & Enrollment Portal

## 0. Chuẩn bị dự án

- [ ] Xác nhận stack: React + React Router ở frontend, Express + MySQL ở backend.
- [x] Cài dependency backend: `bcrypt`, `jsonwebtoken`, `express-validator` hoặc thư viện validation tương đương.
- [ ] Cài dependency frontend: `react-router-dom`, thư viện toast/notification và thư viện test nếu cần.
- [x] Bổ sung `.env.example`; không commit `.env`, JWT secret hoặc thông tin database.
- [x] Cấu hình CORS theo origin frontend và thêm middleware xử lý lỗi tập trung.

## 1. Database và migration

- [x] Tạo database `pks_course` với charset/collation `utf8mb4`.
- [x] Tạo bảng `users`: id, full_name, email unique, password_hash, role (`STUDENT`/`ADMIN`), created_at, updated_at.
- [x] Tạo bảng `courses`: id, name, category, description, instructor, capacity, enrolled_count hoặc tính bằng query, created_at, updated_at.
- [x] Tạo bảng `enrollments`: id, user_id, course_id, enrolled_at; unique `(user_id, course_id)`.
- [x] Thêm foreign key và index cho email, role, course_id, user_id.
- [x] Thêm seed tài khoản admin và dữ liệu khóa học mẫu bằng script riêng; hash mật khẩu bằng bcrypt.
- [ ] Kiểm tra `capacity` là số nguyên dương và không nhỏ hơn số lượng đã đăng ký.

## 2. Backend Express

### Cấu trúc và lỗi

- [x] Tách routes, controllers, services, middlewares và database queries thay vì dồn logic vào `server.js`.
- [x] Thêm middleware parse JSON, CORS, request validation và error handler cuối pipeline.
- [x] Chuẩn hóa response thành công/lỗi và mã HTTP: `400`, `401`, `403`, `404`, `409`, `422`, `500`.
- [x] Giữ và mở rộng `GET /api/health` để kiểm tra API và MySQL.

### Authentication và authorization

- [x] `POST /api/auth/register`: đăng ký bằng họ tên, email, mật khẩu.
- [x] Kiểm tra email hợp lệ và không cho đăng ký email trùng.
- [x] Hash mật khẩu bằng bcrypt với salt rounds tối thiểu 10; tuyệt đối không trả password/hash về client.
- [x] `POST /api/auth/login`: xác thực email/mật khẩu và trả JWT có `userId`, `role`, thời hạn.
- [x] `GET /api/auth/me` hoặc endpoint tương đương để lấy user hiện tại.
- [x] Tạo middleware xác thực Bearer JWT và middleware kiểm tra role.
- [x] Bảo vệ toàn bộ route admin; student không được gọi API quản trị.

### Student APIs

- [x] `GET /api/courses`: danh sách khóa học dạng card, hỗ trợ tìm kiếm theo tên/instructor và lọc category.
- [x] Trả về đầy đủ: tên, danh mục, giảng viên, capacity, số đã đăng ký, trạng thái còn chỗ/hết chỗ.
- [x] `POST /api/courses/:courseId/enroll`: đăng ký khóa học.
- [x] Từ chối đăng ký trùng, khóa học không tồn tại và khóa học đã đầy.
- [x] Dùng transaction + row lock (`SELECT ... FOR UPDATE`) khi kiểm tra/tăng số lượng đăng ký để tránh overbooking.
- [x] `GET /api/me/enrollments`: danh sách khóa học student đã đăng ký.
- [x] `DELETE /api/courses/:courseId/enroll` hoặc endpoint hủy đăng ký nếu phạm vi đề cho phép.

### Admin APIs

- [x] `GET /api/admin/courses`: danh sách khóa học cho admin.
- [x] `POST /api/admin/courses`: tạo khóa học.
- [x] `PUT /api/admin/courses/:id`: chỉnh sửa khóa học.
- [x] `DELETE /api/admin/courses/:id`: xóa khóa học có kiểm tra ràng buộc đăng ký.
- [x] `GET /api/admin/courses/:id/students`: danh sách student đã đăng ký, gồm email, tên, khóa học, thời gian đăng ký, trạng thái.
- [x] Validate body/query params cho tất cả endpoint; không tin dữ liệu từ client.
- [ ] Viết test cho auth, role guard, CRUD khóa học, duplicate enrollment và race condition/capacity.

## 3. Frontend React

### Layout và routing

- [ ] Thay toàn bộ màn hình Vite mặc định bằng giao diện Course & Enrollment Portal.
- [ ] Tạo route đăng ký, đăng nhập, danh sách khóa học, khóa học của tôi và khu vực admin.
- [ ] Tạo `AuthContext`/auth store để lưu user, token, trạng thái loading và logout.
- [ ] Tạo Protected Route cho user đã đăng nhập và Admin Route cho role `ADMIN`.
- [ ] Sau login điều hướng theo role; logout xóa token và reset state.
- [ ] Cấu hình API client dùng `VITE_API_URL`, tự gắn Bearer token và xử lý lỗi chung.

### Student UI

- [ ] Trang đăng ký: form họ tên, email, mật khẩu, confirm password; validation và thông báo lỗi.
- [ ] Trang đăng nhập: loading khi submit, lỗi sai thông tin và nút logout sau khi đăng nhập.
- [ ] Trang danh sách khóa học: card gồm tên, category, instructor, capacity, enrolled count và trạng thái còn/hết chỗ.
- [ ] Thêm ô tìm kiếm theo tên/instructor và bộ lọc category.
- [ ] Nút đăng ký bị disabled khi đang gửi, khi chưa đăng nhập hoặc khi khóa học đã đầy.
- [ ] Hiển thị toast thành công/thất bại sau khi đăng ký.
- [ ] Trang My Enrollments: danh sách khóa học đã đăng ký và trạng thái.
- [ ] Có Loading State, Empty State, Error State và Disabled State cho các luồng chính.

### Admin UI

- [ ] Dashboard/admin page chỉ hiển thị với tài khoản admin.
- [ ] CRUD khóa học bằng form/modal: create, edit, delete; validate capacity và dữ liệu bắt buộc.
- [ ] Bảng danh sách học viên đã đăng ký, có tên, email, khóa học, thời gian và trạng thái.
- [ ] Có confirmation trước thao tác xóa và toast sau mỗi mutation.

### UX/UI bắt buộc

- [ ] Responsive tốt trên desktop và mobile.
- [ ] Có React Router v6+ và Protected Routes.
- [ ] Không dùng `alert()` mặc định; dùng toast notification hoặc UI feedback tương đương.
- [ ] Kiểm tra keyboard focus, label cho input, thông báo lỗi dễ hiểu và màu có đủ tương phản.

## 4. Kiểm thử và nghiệm thu

- [ ] Chạy backend với MySQL thật và kiểm tra `GET /api/health`.
- [ ] Tạo Postman collection cho register, login, courses, enroll, admin CRUD và student list.
- [ ] Test đủ case thành công và lỗi: email trùng, mật khẩu sai, JWT thiếu/hết hạn, sai role, course not found, duplicate enrollment, full capacity.
- [ ] Test transaction bằng nhiều request đăng ký đồng thời; số lượng đăng ký không vượt capacity.
- [ ] Chạy `npm run lint` và `npm run build` ở frontend.
- [ ] Chạy test backend và kiểm tra không còn lỗi runtime/console không cần thiết.
- [ ] Kiểm tra trực tiếp trên desktop và mobile; chụp ảnh/demo các flow chính.

## 5. Git và bàn giao

- [ ] Tổ chức source rõ ràng, tên file/function nhất quán, không để code Vite mẫu.
- [ ] Xóa secret, `.env` và file build khỏi Git; cập nhật `.gitignore`.
- [ ] Viết README cho cả frontend/backend: cài đặt, env, migration/seed, chạy local, API và tài khoản demo.
- [ ] Dùng Conventional Commits, ví dụ: `feat(auth): add JWT login`.
- [ ] Kiểm tra `git status` sạch hợp lý và repository public có thể chạy theo README.
- [ ] Chuẩn bị link GitHub và link demo khi có thể; ghi rõ tech stack và các trade-off.

## Tiêu chí hoàn thành tối thiểu

- [ ] Student có thể register/login, xem/tìm/lọc khóa học và đăng ký khóa học.
- [ ] Admin có thể login, CRUD khóa học và xem danh sách student đăng ký.
- [ ] JWT, bcrypt salt >= 10, role guard, validation, transaction/row lock và unique enrollment hoạt động.
- [ ] Frontend responsive, có loading/empty/disabled/error state và toast feedback.
- [ ] Postman/test kiểm chứng các flow chính; lint/build/README hoàn tất.
