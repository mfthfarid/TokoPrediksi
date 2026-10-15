CREATE TABLE reorder_params (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    lead_time_days INT UNSIGNED NOT NULL,
    service_level_pct TINYINT UNSIGNED NOT NULL,
    t_value DECIMAL(14,2) NOT NULL,
    source ENUM('seed', 'computed') NOT NULL,
    sample_count INT UNSIGNED NOT NULL DEFAULT 0,
    computed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reorderparams_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_reorder_params (product_id, lead_time_days, service_level_pct, source)
);