CREATE OR REPLACE FUNCTION insert_column(
  table_name VARCHAR(70),
  column_name VARCHAR(70)
) RETURNS VOID AS $$
BEGIN
EXECUTE format('ALTER TABLE %I ADD COLUMN %s TEXT',
  table_name, column_name);
END
$$ LANGUAGE plpgsql;
