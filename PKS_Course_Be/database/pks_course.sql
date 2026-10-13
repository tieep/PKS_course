-- --------------------------------------------------------
-- Host:                         127.0.0.2
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for pks_course
CREATE DATABASE IF NOT EXISTS `pks_course` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pks_course`;

-- Dumping structure for table pks_course.courses
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `instructor` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fee` decimal(12,2) unsigned NOT NULL DEFAULT '0.00',
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `capacity` int unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_name_instructor` (`name`,`instructor`),
  KEY `idx_courses_category` (`category`),
  CONSTRAINT `chk_courses_capacity` CHECK ((`capacity` > 0)),
  CONSTRAINT `chk_courses_fee` CHECK ((`fee` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table pks_course.courses: ~6 rows (approximately)
INSERT INTO `courses` (`id`, `name`, `category`, `description`, `instructor`, `fee`, `is_hidden`, `capacity`, `created_at`, `updated_at`) VALUES
	(1, 'React Fundamentals', 'Frontend', 'Xây dựng giao diện React từ component, state đến form.', 'Nguyen Khac Tiep', 2500000.00, 1, 20, '2026-10-11 12:46:51', '2026-10-13 04:10:03'),
	(2, 'Express.js REST API', 'Backend', 'Thiết kế REST API với Express.js, middleware và MySQL.', 'Pham Quoc Tuan', 2200000.00, 0, 25, '2026-10-11 12:46:51', '2026-10-11 12:46:51'),
	(3, 'Fullstack Web Development', 'Fullstack', 'Kết nối React với Express.js để xây dựng ứng dụng hoàn chỉnh.', 'Nguyen Thanh Son', 4500000.00, 0, 20, '2026-10-11 12:46:51', '2026-10-11 12:46:51'),
	(4, 'Database Design with MySQL', 'Database', 'Thiết kế schema, quan hệ, index và transaction trong MySQL.', 'Vo Ngoc Mai', 1800000.00, 0, 1, '2026-10-11 12:46:51', '2026-10-13 02:24:52'),
	(5, 'ffffffff', 'test', 'aaaaaaa', 'aaaaaaaaaa', 0.00, 0, 20, '2026-10-13 02:20:58', '2026-10-13 02:20:58'),
	(6, 'www', 'Frontend', 'ww', 'ww', 0.00, 0, 20, '2026-10-13 03:38:50', '2026-10-13 03:38:50');

-- Dumping structure for table pks_course.enrollments
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `course_id` int unsigned NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollments_user_course` (`user_id`,`course_id`),
  KEY `idx_enrollments_user_id` (`user_id`),
  KEY `idx_enrollments_course_id` (`course_id`),
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table pks_course.enrollments: ~10 rows (approximately)
INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `enrolled_at`) VALUES
	(1, 2, 3, '2026-10-11 12:46:51'),
	(2, 2, 1, '2026-10-11 12:46:51'),
	(4, 3, 2, '2026-10-11 12:46:51'),
	(5, 4, 2, '2026-10-11 12:55:00'),
	(6, 4, 1, '2026-10-11 12:55:20'),
	(7, 4, 4, '2026-10-13 01:34:39'),
	(8, 5, 1, '2026-10-13 01:55:02'),
	(9, 5, 2, '2026-10-13 02:22:00'),
	(10, 6, 1, '2026-10-13 03:16:06'),
	(11, 6, 2, '2026-10-13 03:28:35');

-- Dumping structure for table pks_course.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('STUDENT','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STUDENT',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table pks_course.users: ~6 rows (approximately)
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
	(1, 'PKS Administrator', 'admin@pks-course.local', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', '2026-10-11 12:46:51', '2026-10-11 12:46:51'),
	(2, 'Nguyen Van An', 'student1@pks-course.local', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', '2026-10-11 12:46:51', '2026-10-11 12:46:51'),
	(3, 'Tran Thi Binh', 'student2@pks-course.local', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', '2026-10-11 12:46:51', '2026-10-11 12:46:51'),
	(4, 'nguyen van an', 'duy@example.com', '$2b$10$vNMVK5mGjwfYj3Kfjv8UZ.sOxqToRqsgdM9YInxj9yIOBjLVbnSoq', 'ADMIN', '2026-10-11 12:47:43', '2026-10-13 01:35:59'),
	(5, 'qqqqqqqqq', 'testing@example.com', '$2b$10$T4n08cD4Hx.33H0W9089quceGBd70JjCqzzc6DcJlvLB0LoKx9Coe', 'STUDENT', '2026-10-13 01:54:57', '2026-10-13 01:54:57'),
	(6, 'Noname 1111', 'tiepte@gmail.com', '$2b$10$HNyb4qC9nCGO4mn6hJpaweK2ndgO1z9VvUJeMIOwr8SHkSxwF44t.', 'ADMIN', '2026-10-13 02:54:36', '2026-10-13 03:40:42'),
	(7, 'wwwwww', 'duy11@example.com', '$2b$10$Uo2JiVwP48sPc4c0dcP8WunRCX51R/ZKJEqdQNS7grtEyvDt/EU32', 'STUDENT', '2026-10-13 05:15:27', '2026-10-13 05:15:27'),
	(8, 'Noname 1111', 'tiepte111@gmail.com', '$2b$10$9ZSgVk6854T29nggVk.54uUO91Q0ztWwah1DH.2BARN37cusfvkoS', 'STUDENT', '2026-10-13 05:17:37', '2026-10-13 05:17:37');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
