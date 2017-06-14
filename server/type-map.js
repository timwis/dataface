module.exports = {
  encodeType,
  decodeType
}

const typeMap = {
  text: {
    mapsTo: 'text',
    mapsFrom: [
      'character',
      'character varying',
      'text'
    ]
  },
  number: {
    mapsTo: 'numeric',
    mapsFrom: [
      'integer',
      'smallint',
      'bigint',
      'numeric',
      'decimal',
      'real',
      'double precision',
      'money'
    ]
  },
  checkbox: {
    mapsTo: 'boolean',
    mapsFrom: ['boolean']
  }
}

const reverseTypeMap = createReverseTypeMap(typeMap)

function createReverseTypeMap (typeMap) {
  const reverseTypeMap = {}
  for (let friendlyType in typeMap) {
    typeMap[friendlyType].mapsFrom.forEach((pgType) => {
      reverseTypeMap[pgType] = friendlyType
    })
  }
  return reverseTypeMap
}

function encodeType (friendlyType) {
  const matchedType = typeMap[friendlyType]
  return matchedType ? matchedType.mapsTo : null
}

function decodeType (pgType) {
  const matchedType = reverseTypeMap[pgType]
  return matchedType || null
}
