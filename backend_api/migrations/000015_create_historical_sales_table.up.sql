CREATE TABLE historical_sales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    sale_date DATE NOT NULL,
    quantity_sold DECIMAL(10,2) UNSIGNED NOT NULL,
    price_sold INT UNSIGNED NOT NULL,
    imported_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_historicalsales_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    INDEX idx_historicalsales_product_date (product_id, sale_date)
);