CREATE TABLE transaction_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_unit_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(10,2) UNSIGNED NOT NULL,
    quantity_base DECIMAL(10,2) UNSIGNED NOT NULL,
    price_at_sale INT UNSIGNED NOT NULL,
    cost_price INT UNSIGNED NOT NULL,
    subtotal INT UNSIGNED NOT NULL,

    CONSTRAINT fk_transitems_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_transitems_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_transitems_productunit
        FOREIGN KEY (product_unit_id) REFERENCES product_units(id)
        ON DELETE RESTRICT
);