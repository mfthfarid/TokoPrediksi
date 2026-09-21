CREATE TABLE historical_sales_cleaned (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    sale_date DATE NOT NULL,
    quantity_sold DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_filled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_historicalsalescleaned_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_product_date (product_id, sale_date)
);