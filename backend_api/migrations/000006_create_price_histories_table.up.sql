CREATE TABLE price_histories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_unit_id BIGINT UNSIGNED NOT NULL,
    old_price INT UNSIGNED NULL,
    new_price INT UNSIGNED NOT NULL,
    changed_by INT NULL,
    changed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pricehist_productunit
        FOREIGN KEY (product_unit_id) REFERENCES product_units(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_pricehist_user
        FOREIGN KEY (changed_by) REFERENCES users(id)
        ON DELETE SET NULL
);