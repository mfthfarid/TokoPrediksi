CREATE TABLE predictions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    run_id VARCHAR(36) NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    prediction_date DATE NOT NULL,
    predicted_quantity DECIMAL(14,2) NOT NULL,
    yhat_lower DECIMAL(14,2) NULL,
    yhat_upper DECIMAL(14,2) NULL,
    model_version VARCHAR(64) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_predictions_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    INDEX idx_predictions_product_run (product_id, run_id),
    INDEX idx_predictions_product_date (product_id, prediction_date)
);