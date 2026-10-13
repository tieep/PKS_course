CREATE DATABASE IF NOT EXISTS pks_course
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE pks_course;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NULL,
  instructor VARCHAR(120) NOT NULL,
  fee DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  capacity INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courses_name_instructor (name, instructor),
  KEY idx_courses_category (category),
  CONSTRAINT chk_courses_fee CHECK (fee >= 0),
  CONSTRAINT chk_courses_capacity CHECK (capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enrollments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_enrollments_user_course (user_id, course_id),
  KEY idx_enrollments_user_id (user_id),
  KEY idx_enrollments_course_id (course_id),
  CONSTRAINT fk_enrollments_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course
    FOREIGN KEY (course_id) REFERENCES courses (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password mẫu của các tài khoản demo: password
-- Hash bcrypt này chỉ dùng cho local/demo, không dùng production.
INSERT INTO users (full_name, email, password_hash, role)
VALUES
  ('PKS Administrator', 'admin@pks-course.local', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
  ('Nguyen Van An', 'student1@pks-course.local', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT'),
  ('Tran Thi Binh', 'student2@pks-course.local', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  role = VALUES(role);

INSERT INTO courses (name, category, description, instructor, fee, capacity)
VALUES
  ('React Fundamentals', 'Frontend', 'Xây dựng giao diện React từ component, state đến form.', 'Le Minh Hoang', 2500000.00, 30),
  ('Express.js REST API', 'Backend', 'Thiết kế REST API với Express.js, middleware và MySQL.', 'Pham Quoc Tuan', 2200000.00, 25),
  ('Fullstack Web Development', 'Fullstack', 'Kết nối React với Express.js để xây dựng ứng dụng hoàn chỉnh.', 'Nguyen Thanh Son', 4500000.00, 20),
  ('Database Design with MySQL', 'Database', 'Thiết kế schema, quan hệ, index và transaction trong MySQL.', 'Vo Ngoc Mai', 1800000.00, 15)
ON DUPLICATE KEY UPDATE
  category = VALUES(category),
  description = VALUES(description),
  fee = VALUES(fee),
  capacity = VALUES(capacity);

INSERT IGNORE INTO enrollments (user_id, course_id)
SELECT student.id, course.id
FROM users AS student
CROSS JOIN courses AS course
WHERE student.email = 'student1@pks-course.local'
  AND course.name IN ('React Fundamentals', 'Fullstack Web Development');

INSERT IGNORE INTO enrollments (user_id, course_id)
SELECT student.id, course.id
FROM users AS student
CROSS JOIN courses AS course
WHERE student.email = 'student2@pks-course.local'
  AND course.name IN ('Express.js REST API');

