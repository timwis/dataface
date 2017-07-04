const { typeMap } = require('./type-map')

const validTypes = Object.keys(typeMap)

module.exports = {
  sheet: {
    properties: {
      name: {
        type: 'string'
      }
    },
    required: ['name']
  },
  column: {
    properties: {
      name: {
        type: 'string'
      },
      type: {
        enum: validTypes
      }
    },
    required: ['name']
  }
}
