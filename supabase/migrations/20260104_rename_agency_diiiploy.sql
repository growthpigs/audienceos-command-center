-- Rename agency from "Acme Marketing Agency" to "Diiiploy"
-- Run this in Supabase SQL Editor

UPDATE agency
SET name = 'Diiiploy',
    updated_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Verify the change
SELECT id, name, updated_at FROM agency;
