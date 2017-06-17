exports.setup = async function (db) {
  await db.schema
    .createTable('people', function (t) {
      t.increments('id').primary()
      t.text('name')
      t.integer('age')
    })
  await db('people').insert([
    { name: 'John', age: 19 },
    { name: 'Jane', age: 20 },
    { name: 'Tina', age: 45 },
    { name: 'Isaac', age: 32 }
  ])
}

exports.teardown = function (db) {
  return db.schema
    .dropTableIfExists('people')
}
