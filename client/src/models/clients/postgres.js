const axios = require('axios')
const squel = require('squel')

const endpoint = 'http://localhost:8080'

module.exports = {
  getTables () {
    const query = `
      SELECT tablename AS name
      FROM pg_catalog.pg_tables
      WHERE schemaname='public'
      ORDER BY tablename
    `
    return request(query)
  },

  getRows (table, limit = 0, offset = 0) {
    const query = squel
      .select()
      .from(table)
      .limit(limit)
      .offset(offset)
      .toString()

    return request(query)
  },

  getSchema (table) {
    const query = squel
      .select()
      .field('column_name', 'name')
      .field('data_type', 'type')
      .field('character_maximum_length', 'length')
      .from('information_schema.columns')
      .where('table_name = ?', table)
      .toString()

    return request(query)
  }
}

function request (query) {
  return axios.post(endpoint, {query})
    .then((response) => response.data.rows)
}
