const test = require('ava')
const assert = require('assert')
const knex = require('knex')
const supertest = require('supertest')

const createServer = require('../index')
const dbHelper = require('./helpers/db')

const DB_URI = process.env.DB_URI
assert(DB_URI, 'DB_URI environment variable must be set')
const db = knex({ client: 'pg', connection: DB_URI, ssl: true })

test.before(async function (t) {
  await dbHelper.teardown(db)
})

test.beforeEach(async function (t) {
  await dbHelper.setup(db)
  t.context.request = supertest(createServer(db).listen())
})

test.afterEach.always(async function (t) {
  await dbHelper.teardown(db)
})

test('list sheets', async (t) => {
  return t.context.request
    .get('/sheets')
    .expect(200)
    .expect('Content-type', 'application/json; charset=utf-8')
    .then((res) => {
      t.is(res.body.length, 1)
    })
})

test('create sheet', async (t) => {
  const payload = { name: 'tags' }
  return t.context.request
    .post('/sheets')
    .send(payload)
    .expect(201)
    .then((res) => {
      t.is(res.body.name, 'tags')
    })
})

test('create sheet: missing name yields validation error', async (t) => {
  return t.context.request
    .post('/sheets')
    .send({})
    .expect(422)
    .then(() => t.pass())
})

test('get sheet', async (t) => {
  return t.context.request
    .get('/sheets/people')
    .expect(200, { name: 'people' })
    .then(() => t.pass())
})

// test.failing('get sheet: invalid name returns 404', async (t) => {
//   return t.context.request
//     .get('/sheets/foo')
//     .expect(404)
// })

test('update sheet', async (t) => {
  const payload = { name: 'people_renamed' }
  return t.context.request
    .patch('/sheets/people')
    .send(payload)
    .expect(200, { name: 'people_renamed' })
    .then(() => t.pass())
})
