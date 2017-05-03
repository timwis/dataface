DROP FUNCTION IF EXISTS get_schema(character varying);
CREATE OR REPLACE FUNCTION get_schema(table_name_param VARCHAR(70))
RETURNS TABLE (
	name information_schema.sql_identifier,
	type information_schema.character_data,
	length information_schema.cardinal_number,
	"default" information_schema.character_data,
	"null" BOOLEAN,
	custom JSONB
) AS $$
SELECT
	cols.column_name,
	cols.data_type,
	cols.character_maximum_length,
	cols.column_default,
	cols.is_nullable::boolean,
	pg_catalog.col_description(c.oid, cols.ordinal_position::int)::jsonb
FROM
	pg_catalog.pg_class c,
	information_schema.columns cols
WHERE
	cols.table_catalog = 'postgres' AND
	cols.table_schema = 'public' AND
	cols.table_name = table_name_param AND
	cols.table_name = c.relname;
$$ LANGUAGE SQL;
