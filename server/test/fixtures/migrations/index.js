exports.up = function (db) {
  return db.schema
    .createTable('people', function (t) {
      t.increments('id').primary()
      t.text('name')
      t.integer('age')
    })
}

exports.down = function (db) {
  return db.schema
    .dropTableIfExists('people')
}
