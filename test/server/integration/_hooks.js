const hooks = require('hooks') // provided by dredd
const assert = require('assert')
const knex = require('knex')
const axios = require('axios')
const Cookie = require('tough-cookie').Cookie
const urlJoin = require('url-join')

const dbHelper = require('../helpers/db')

const API_HOST = 'http://localhost:3000/api'
const DB_URL = process.env.DB_URL
assert(DB_URL, 'DB_URL environment variable must be set')

let db, cookie

hooks.beforeAll(async function (transactions, done) {
  db = knex({ client: 'pg', connection: DB_URL, ssl: true })
  await dbHelper.teardown(db)

  cookie = getAuthCookie()
  done()
})

hooks.beforeEach(async function (transaction, done) {
  await dbHelper.setup(db)
  transaction.request.headers.Cookie = cookie
  done()
})

hooks.afterEach(async function (transaction, done) {
  await dbHelper.teardown(db)
  done()
})

async function getAuthCookie () {
  try {
    const endpoint = urlJoin(API_HOST, '/authenticate-test')
    const response = await axios.post(endpoint)
    cookie = response.headers['set-cookie']
      .map(Cookie.parse)
      .map((parsedCookie) => parsedCookie.cookieString())
      .join(';')
  } catch (err) {
    console.error('Authentication failed', err)
  }
}
