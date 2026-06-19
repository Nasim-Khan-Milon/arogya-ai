-- =========================
-- Table A: users
-- =========================
CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    center_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Table B: triage_sessions
-- =========================
CREATE TABLE triage_sessions (
    session_id VARCHAR(20) PRIMARY KEY,
    assigned_worker_id BIGINT UNSIGNED NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20),
    village_ward VARCHAR(255),
    systolic_bp INT,
    diastolic_bp INT,
    heart_rate INT,
    spo2_level INT,
    temperature_f DECIMAL(4,1),
    transcript_bn TEXT,
    translation_en TEXT,
    triage_level ENUM('red', 'yellow', 'green') NOT NULL,
    status_label VARCHAR(100),
    ai_diagnosis_json JSON,
    ai_first_aid TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assigned_worker
        FOREIGN KEY (assigned_worker_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);






