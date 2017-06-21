const hooks = require('hooks') // provided by dredd
const assert = require('assert')
const knex = require('knex')

const dbHelper = require('../helpers/db')

let db

hooks.beforeAll(async function (transactions, done) {
  const DB_URL = process.env.DB_URL
  assert(DB_URL, 'DB_URL environment variable must be set')
  db = knex({ client: 'pg', connection: DB_URL, ssl: true })
  await dbHelper.teardown(db)
  done()
})

hooks.beforeEach(async function (transaction, done) {
  await dbHelper.setup(db)
  done()
})

hooks.afterEach(async function (transaction, done) {
  await dbHelper.teardown(db)
  done()
})
