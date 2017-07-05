const { typeMap } = require('./type-map')

const validTypes = Object.keys(typeMap)

const schemas = {
  sheet: {
    properties: {
      name: {
        type: 'string'
      }
    }
  },
  column: {
    properties: {
      name: {
        type: 'string'
      },
      type: {
        enum: validTypes
      }
    }
  }
}

module.exports = {
  sheet: {
    create: addRequired(schemas.sheet, ['name']),
    update: schemas.sheet
  },
  column: {
    create: addRequired(schemas.column, ['name']),
    update: schemas.column
  }
}

function addRequired (source, required) {
  return Object.assign({}, source, { required })
}
