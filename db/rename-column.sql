CREATE OR REPLACE FUNCTION rename_column(
  table_name VARCHAR(70),
  old_name VARCHAR(70),
  new_name VARCHAR(70)
) RETURNS VOID AS $$
BEGIN
EXECUTE format('ALTER TABLE %I RENAME COLUMN %s TO %s',
  table_name, old_name, new_name);
END
$$ LANGUAGE plpgsql;
