CREATE TABLE product_units (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    unit_id BIGINT UNSIGNED NOT NULL,
    barcode VARCHAR(50) NULL UNIQUE,
    conversion_to_base DECIMAL(10,2) UNSIGNED NOT NULL,
    sell_price INT UNSIGNED NULL,
    is_base_unit BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_productunits_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_productunits_unit
        FOREIGN KEY (unit_id) REFERENCES units(id)
        ON DELETE RESTRICT,
    UNIQUE KEY uq_product_unit (product_id, unit_id)
);