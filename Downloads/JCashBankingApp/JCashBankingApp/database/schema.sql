-- MobiCash Banking App - import this file in phpMyAdmin (Import tab) or paste it in the SQL tab.
CREATE DATABASE IF NOT EXISTS mobicash_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE mobicash_db;

CREATE TABLE IF NOT EXISTS users (
    id            BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(11)   NOT NULL UNIQUE,
    pin           CHAR(64)      NOT NULL,            -- SHA-256 hash of the PIN
    full_name     VARCHAR(100)  NOT NULL,
    balance       DECIMAL(15,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
    id         BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT        NOT NULL,
    type       VARCHAR(20)   NOT NULL,               -- CASH_IN, TRANSFER_OUT, TRANSFER_IN
    amount     DECIMAL(15,2) NOT NULL,
    details    VARCHAR(255),
    created_at DATETIME      NOT NULL,
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_tx_user (user_id)                      -- performance tuning
) ENGINE=InnoDB;

-- Demo accounts (PIN 1234 and 4321)
INSERT IGNORE INTO users (mobile_number, pin, full_name, balance) VALUES
('09171234567', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'Juan Dela Cruz', 1000.00),
('09981234567', 'fe2592b42a727e977f055947385b709cc82b16b9a87f88c6abf3900d65d0cdc3', 'Maria Santos',    500.00);
