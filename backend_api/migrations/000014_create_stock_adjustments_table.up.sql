CREATE TABLE stock_adjustments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    tanggal_kadaluwarsa DATE NULL,
    quantity_adjusted DECIMAL(10,2) UNSIGNED NOT NULL,
    adjustment_type ENUM('retur', 'rugi') NOT NULL,
    estimated_loss INT UNSIGNED NOT NULL DEFAULT 0,
    note VARCHAR(255) NULL,
    created_by INT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_adjustments_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_adjustments_user
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_adjustments_product_date (product_id, tanggal_kadaluwarsa)
);