# PKS Course Backend

Backend Node.js sử dụng Express và MySQL.

## Cài đặt

1. Tạo database trong MySQL:

```sql
CREATE DATABASE pks_course CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Sao chép `.env.example` thành `.env` và cập nhật thông tin MySQL.

3. Cài dependency:

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

API mặc định chạy tại `http://localhost:3000`.

- `GET /api/health`: kiểm tra API và kết nối MySQL.