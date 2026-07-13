CREATE TABLE predictions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    prediction_date DATE NOT NULL,
    predicted_quantity INT NOT NULL,
    yhat_lower INT NULL,
    yhat_upper INT NULL,
    model_version VARCHAR(50) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_predictions_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);