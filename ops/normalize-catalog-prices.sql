-- One-time correction for the 95 Silva catalog variants imported at 100x.
-- Requires a current pg_dump and a PDF/SKU audit before execution.
-- Run with psql -v ON_ERROR_STOP=1. The transaction rolls back on any guard failure.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE TEMP TABLE silva_price_candidates ON COMMIT DROP AS
SELECT pr.id AS price_id, v.sku, pr.amount AS old_amount,
  CASE v.sku WHEN 'SM-052' THEN 3250 WHEN 'SM-053' THEN 3750 WHEN 'SM-054' THEN 3050 ELSE pr.amount / 100 END AS new_amount
FROM product p
JOIN product_variant v ON v.product_id = p.id
JOIN product_variant_price_set pv ON pv.variant_id = v.id
JOIN price pr ON pr.price_set_id = pv.price_set_id
WHERE p.deleted_at IS NULL
  AND v.deleted_at IS NULL
  AND pr.deleted_at IS NULL
  AND pr.price_list_id IS NULL
  AND pr.currency_code = 'brl'
  AND v.sku ~ '^SM-[0-9]{3}$';

DO $$
BEGIN
  IF (SELECT count(*) FROM silva_price_candidates) <> 95
    OR (SELECT count(DISTINCT sku) FROM silva_price_candidates) <> 95
    OR (SELECT count(DISTINCT price_id) FROM silva_price_candidates) <> 95
    OR EXISTS (SELECT 1 FROM silva_price_candidates WHERE sku < 'SM-001' OR sku > 'SM-095')
    OR EXISTS (
      SELECT 1 FROM silva_price_candidates c
      JOIN price pr ON pr.id = c.price_id
      WHERE c.old_amount <= 0
        OR c.old_amount % 100 <> 0
        OR pr.raw_amount->>'value' <> c.old_amount::text
    )
  THEN
    RAISE EXCEPTION 'Catalog price guards failed; no prices changed';
  END IF;
  IF EXISTS (SELECT 1 FROM silva_price_candidates WHERE
    (sku = 'SM-052' AND old_amount <> 200000) OR
    (sku = 'SM-053' AND old_amount <> 250000) OR
    (sku = 'SM-054' AND old_amount <> 180000))
  THEN
    RAISE EXCEPTION 'Support-inclusive product prices changed since audit';
  END IF;
  IF EXISTS (SELECT 1 FROM payment_session WHERE deleted_at IS NULL)
  THEN
    RAISE EXCEPTION 'Payment sessions exist; reconcile before changing catalog scale';
  END IF;
END $$;

UPDATE price pr
SET amount = c.new_amount,
    raw_amount = jsonb_set(pr.raw_amount, '{value}', to_jsonb(c.new_amount::text)),
    updated_at = now()
FROM silva_price_candidates c
WHERE pr.id = c.price_id AND pr.amount = c.old_amount;

UPDATE product p
SET subtitle = 'Suporte incluso no valor anunciado.', updated_at = now()
WHERE p.id IN (SELECT product_id FROM product_variant WHERE sku IN ('SM-052', 'SM-053', 'SM-054') AND deleted_at IS NULL);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM silva_price_candidates c
    JOIN price pr ON pr.id = c.price_id
    WHERE pr.amount <> c.new_amount
       OR pr.raw_amount->>'value' <> c.new_amount::text
  ) THEN
    RAISE EXCEPTION 'Price post-check failed; rolling back';
  END IF;
END $$;

COMMIT;
