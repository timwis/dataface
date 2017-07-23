const { stringify } = require('query-string')

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN
const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL

const loginParams = {
  response_type: 'code',
  scope: 'openid profile',
  client_id: AUTH0_CLIENT_ID,
  redirect_uri: AUTH0_CALLBACK_URL
}

module.exports = `https://${AUTH0_DOMAIN}/authorize?${stringify(loginParams)}`
