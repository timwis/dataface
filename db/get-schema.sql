DROP FUNCTION IF EXISTS get_schema(character varying);
CREATE OR REPLACE FUNCTION get_schema(table_name_param VARCHAR(70))
RETURNS TABLE (
	name information_schema.sql_identifier,
	type information_schema.character_data,
	length information_schema.cardinal_number,
	"default" information_schema.character_data,
	"null" BOOLEAN,
    "constraint" information_schema.character_data,
	custom JSONB
) AS $$
SELECT
	cols.column_name,
	cols.data_type,
	cols.character_maximum_length,
	cols.column_default,
	cols.is_nullable::boolean,
	constr.constraint_type,
	pg_catalog.col_description(cls.oid, cols.ordinal_position::int)::jsonb
FROM
	pg_catalog.pg_class cls,
	information_schema.columns cols
LEFT JOIN
	information_schema.key_column_usage keys
	ON keys.column_name = cols.column_name
	AND keys.table_catalog = cols.table_catalog
	AND keys.table_schema = cols.table_schema
	AND keys.table_name = cols.table_name
LEFT JOIN
	information_schema.table_constraints constr
	ON constr.constraint_name = keys.constraint_name
WHERE
	cols.table_schema = 'public' AND
	cols.table_name = table_name_param AND
	cols.table_name = cls.relname;
$$ LANGUAGE SQL;
