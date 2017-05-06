CREATE OR REPLACE FUNCTION drop_column(
  table_name VARCHAR(70),
  column_name VARCHAR(70)
) RETURNS VOID AS $$
BEGIN
EXECUTE format('ALTER TABLE %I DROP COLUMN %s',
  table_name, column_name);
END
$$ LANGUAGE plpgsql;
