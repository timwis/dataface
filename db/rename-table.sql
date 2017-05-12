CREATE OR REPLACE FUNCTION rename_table(
  old_name VARCHAR(70),
  new_name VARCHAR(70)
) RETURNS VOID AS $$
BEGIN
EXECUTE format('ALTER TABLE %I RENAME TO %s',
  old_name, new_name);
END
$$ LANGUAGE plpgsql;
