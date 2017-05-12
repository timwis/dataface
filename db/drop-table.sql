CREATE OR REPLACE FUNCTION drop_table(
  table_name VARCHAR(70)
) RETURNS VOID AS $$
BEGIN
EXECUTE format('DROP TABLE %I', table_name);
END
$$ LANGUAGE plpgsql;
