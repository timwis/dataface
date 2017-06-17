exports.seed = function (db) {
  return db('people').insert([
    { name: 'John', age: 19 },
    { name: 'Jane', age: 20 },
    { name: 'Tina', age: 45 },
    { name: 'Isaac', age: 32 }
  ])
}

exports.down = function (db) {
  console.log('seeds down')
}
