-- ====================================================================================================
-- SIMATS ENGINEERING - Saveetha Institute of Medical and Technical Sciences, Chennai
-- Capstone Project: Constraint-Based Examination Timetable and Conflict-Free Resource Allocation System
-- Team: M. Thanuja (192425356), Dasari Sai Pavani (192520032), P. Varshini (192472372)
-- Guide: Dr. Charlyn Pusha Latha, Professor
-- MySQL Database DDL Schema
-- ====================================================================================================

CREATE DATABASE IF NOT EXISTS exam_timetable_db;
USE exam_timetable_db;

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_ADMIN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Students
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    academic_year VARCHAR(20) DEFAULT '2026-2027',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Courses
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Student Registrations (Many-to-Many Enrollment)
CREATE TABLE IF NOT EXISTS student_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    academic_year VARCHAR(20) DEFAULT '2026-2027',
    CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uk_student_course UNIQUE (student_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Examinations
CREATE TABLE IF NOT EXISTS examinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    exam_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    exam_type VARCHAR(50) NOT NULL DEFAULT 'END_SEMESTER',
    duration_minutes INT NOT NULL DEFAULT 180,
    student_count INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_exam_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Time Slots
CREATE TABLE IF NOT EXISTS time_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slot_name VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type VARCHAR(20) NOT NULL DEFAULT 'FORENOON',
    slot_order INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Rooms (Halls & Labs)
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    room_type VARCHAR(50) NOT NULL DEFAULT 'LECTURE_HALL',
    has_projector BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Faculty Members
CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    max_invigilation_per_day INT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Faculty Leave & Unavailability
CREATE TABLE IF NOT EXISTS faculty_unavailability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id BIGINT NOT NULL,
    unavailable_date DATE NOT NULL,
    time_slot_id BIGINT NULL,
    reason VARCHAR(200),
    CONSTRAINT fk_unav_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    CONSTRAINT fk_unav_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Configurable Scheduling Constraints
CREATE TABLE IF NOT EXISTS scheduling_constraints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    constraint_key VARCHAR(100) NOT NULL UNIQUE,
    constraint_name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    constraint_value VARCHAR(100) NOT NULL,
    is_hard_constraint BOOLEAN DEFAULT TRUE,
    is_enabled BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Timetable Schedules
CREATE TABLE IF NOT EXISTS timetable_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'GENERATED',
    algorithm_used VARCHAR(100) DEFAULT 'DSATUR_GRAPH_COLOURING',
    total_exams INT DEFAULT 0,
    scheduled_exams INT DEFAULT 0,
    conflict_count INT DEFAULT 0,
    summary VARCHAR(1000),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Schedule Items (Allocated Examination, Slot, Room, Faculty)
CREATE TABLE IF NOT EXISTS schedule_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT NOT NULL,
    examination_id BIGINT NOT NULL,
    time_slot_id BIGINT NULL,
    room_id BIGINT NULL,
    faculty_id BIGINT NULL,
    student_count INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    conflict_reason VARCHAR(500),
    alternative_suggestion VARCHAR(500),
    CONSTRAINT fk_item_schedule FOREIGN KEY (schedule_id) REFERENCES timetable_schedules(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_exam FOREIGN KEY (examination_id) REFERENCES examinations(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL,
    CONSTRAINT fk_item_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    CONSTRAINT fk_item_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Schedule Conflicts (Audit & Resolution)
CREATE TABLE IF NOT EXISTS schedule_conflicts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT NOT NULL,
    conflict_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'HARD',
    description VARCHAR(1000) NOT NULL,
    examination1_id BIGINT NULL,
    examination2_id BIGINT NULL,
    student_id BIGINT NULL,
    room_id BIGINT NULL,
    faculty_id BIGINT NULL,
    time_slot_id BIGINT NULL,
    suggested_resolution VARCHAR(1000),
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conf_schedule FOREIGN KEY (schedule_id) REFERENCES timetable_schedules(id) ON DELETE CASCADE,
    CONSTRAINT fk_conf_exam1 FOREIGN KEY (examination1_id) REFERENCES examinations(id) ON DELETE SET NULL,
    CONSTRAINT fk_conf_exam2 FOREIGN KEY (examination2_id) REFERENCES examinations(id) ON DELETE SET NULL,
    CONSTRAINT fk_conf_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    CONSTRAINT fk_conf_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    CONSTRAINT fk_conf_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
    CONSTRAINT fk_conf_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    details VARCHAR(2000),
    performed_by VARCHAR(100) NOT NULL DEFAULT 'ADMIN',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

