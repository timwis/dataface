require('dotenv').config()
const knex = require('knex')
const fastify = require('fastify')()

const connString = process.env.CONNECTION_STRING
const port = process.env.PORT || 8080
const db = knex({ client: 'pg', connection: connString })

fastify.use(require('cors')())

const schema = {
  payload: {
    query: { type: 'string' }
  }
}

fastify.post('/', schema, async (request, reply) => {
  try {
    const response = await db.raw(request.body.query)
    reply.send(response)
  } catch (err) {
    reply.code(500).send(err)
  }
})

fastify.listen(port, (err) => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
