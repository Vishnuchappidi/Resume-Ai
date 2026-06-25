-- ============================================================
--  ResumeAI Pro — Database Schema
--  MySQL 8+
--  Spring JPA auto-creates these, but you can also run manually.
-- ============================================================

CREATE DATABASE IF NOT EXISTS resume_analyzer
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE resume_analyzer;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  full_name   VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Resume Analyses ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_analysis (
  id                       BIGINT  NOT NULL AUTO_INCREMENT,
  user_id                  BIGINT  NOT NULL,
  resume_text              LONGTEXT NOT NULL,
  file_name                VARCHAR(255),
  ats_score                INT,
  strengths                TEXT,
  missing_skills           TEXT,
  suggestions              TEXT,
  recommended_technologies TEXT,
  recommended_projects     TEXT,
  job_roles                TEXT,
  created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_resume_user_id (user_id),
  INDEX idx_resume_created_at (created_at),
  CONSTRAINT fk_resume_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
