-- =========================================================
-- SIGAP — Sistem Informasi Gangguan & Perbaikan
-- PT Kebon Agung Pabrik Gula Trangkil
-- MySQL Database Dump & Schema Definition
-- Compatible with: XAMPP, phpMyAdmin, MariaDB 10+, MySQL 5.7+ / 8.0+
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

-- ---------------------------------------------------------
-- Database Initialization
-- ---------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `sigap_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sigap_db`;

-- ---------------------------------------------------------
-- 1. Table Structure for `reports` (Laporan Kerusakan)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` VARCHAR(36) NOT NULL,
  `ticket_number` VARCHAR(50) NOT NULL,
  `nama_pelapor` VARCHAR(150) NOT NULL,
  `bagian` VARCHAR(100) NOT NULL,
  `unit_kerja` VARCHAR(150) NOT NULL,
  `nomor_hp` VARCHAR(30) DEFAULT NULL,
  `lokasi_kerusakan` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `foto_url` LONGTEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'MENUNGGU',
  `penanganan` TEXT DEFAULT NULL,
  `processed_at` DATETIME(3) DEFAULT NULL,
  `completed_at` DATETIME(3) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `reports_ticket_number_unique` (`ticket_number`),
  KEY `idx_reports_status` (`status`),
  KEY `idx_reports_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 2. Table Structure for `activity_logs` (Log Audit Trail Petugas)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` VARCHAR(36) NOT NULL,
  `waktu` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `admin` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN',
  `aktivitas` VARCHAR(100) NOT NULL,
  `target` VARCHAR(100) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_logs_waktu` (`waktu`),
  KEY `idx_logs_aktivitas` (`aktivitas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 3. Table Structure for `admin_users` (Manajemen Akun Administrator)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  `is_banned` TINYINT(1) NOT NULL DEFAULT 0,
  `banned_until` DATETIME(3) DEFAULT NULL,
  `banned_reason` TEXT DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_users_username_unique` (`username`),
  KEY `idx_admin_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 4. Initial Seed Data: Default Super Admin Account Only
-- 
-- Akun Login Bawaan:
-- Super Admin -> Username: superadmin | Password: super123
-- ---------------------------------------------------------
INSERT INTO `admin_users` (`id`, `username`, `password`, `nama`, `role`, `is_banned`, `created_at`, `updated_at`) VALUES
('adm-super-001', 'superadmin', '$2b$10$xOKrgkg9BvNwaltLeCLtPuWkrRna/l4GT/X33JetzW.AvL4VujukC', 'Super Admin SIGAP', 'SUPER_ADMIN', 0, NOW(3), NOW(3));

-- ---------------------------------------------------------
-- 5. Initial Seed Data: Sample Activity Log
-- ---------------------------------------------------------
INSERT INTO `activity_logs` (`id`, `waktu`, `admin`, `role`, `aktivitas`, `target`, `deskripsi`) VALUES
('log-init-001', NOW(3), 'Super Admin SIGAP', 'SUPER_ADMIN', 'INISIALISASI SISTEM', 'SISTEM', 'Database SIGAP PG Trangkil berhasil diinisialisasi.');

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- END OF MYSQL DUMP SCRIPT
-- =========================================================
