const PostgREST = require('postgrest-client')
const keys = require('lodash/keys')

const postgrestHost = process.env.POSTGREST_HOST
const db = new PostgREST(postgrestHost)

module.exports = {
  getTables () {
    return db.get('/')
      .set('Accept', '*/*') // https://github.com/begriffs/postgrest/issues/860
      .then((data) => {
        return keys(data.definitions)
          .filter((table) => !table.startsWith('(rpc)'))
          .map((table) => ({name: table}))
      })
  },

  getRows (table, limit = 0, offset = 0) {
    const from = offset
    const to = offset + limit
    return db.get(`/${table}`)
      .range(from, to)
      .order('`1`', true) // first column ascending
      .set('Accept', '*/*') // https://github.com/begriffs/postgrest/issues/860
  },

  getSchema (table) {
    return db.post('/rpc/get_schema')
      .send({ table_name_param: table })
      .set('Accept', '*/*') // https://github.com/begriffs/postgrest/issues/860
  },

  update (table, updates, conditions) {
    return db.patch(`/${table}`)
      .set('Prefer', 'return=representation') // include row in response
      .set('Accept', 'application/vnd.pgrst.object+json') // return obj not array
      .match(conditions)
      .send(updates)
  },

  deleteRow (table, conditions) {
    return db.delete(`/${table}`)
      .match(conditions)
  },

  renameField (table, oldValue, value) {
    return db.post('/rpc/rename_column')
      .send({ table_name: table, old_name: oldValue, new_name: value })
      .set('Accept', '*/*') // https://github.com/begriffs/postgrest/issues/860
  }
}
