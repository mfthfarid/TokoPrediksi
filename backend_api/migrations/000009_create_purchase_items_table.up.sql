CREATE TABLE purchase_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    purchase_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_unit_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    quantity_base INT UNSIGNED NOT NULL,
    quantity_remaining INT UNSIGNED NOT NULL,
    purchase_price INT UNSIGNED NOT NULL,
    cost_per_base INT UNSIGNED NOT NULL,
    tanggal_kadaluwarsa DATE NULL,
    subtotal INT UNSIGNED NOT NULL,

    CONSTRAINT fk_purchaseitems_purchase
        FOREIGN KEY (purchase_id) REFERENCES purchases(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_purchaseitems_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_purchaseitems_productunit
        FOREIGN KEY (product_unit_id) REFERENCES product_units(id)
        ON DELETE RESTRICT,

    INDEX idx_purchaseitems_fifo (product_id, purchase_id)
);