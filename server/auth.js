const passport = require('koa-passport')
const Auth0Strategy = require('passport-auth0')
const pick = require('lodash/pick')

const {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_CALLBACK_URL
} = process.env

if (AUTH0_DOMAIN && AUTH0_CLIENT_ID && AUTH0_CLIENT_SECRET && AUTH0_CALLBACK_URL) {
  const strategy = new Auth0Strategy({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    callbackURL: AUTH0_CALLBACK_URL
  }, function (accessToken, refreshToken, extraParams, profile, done) {
    done(null, profile)
  })

  passport.use(strategy)
}

passport.serializeUser(function (user, done) {
  const profile = pick(user, ['displayName', 'picture', 'nickname'])
  done(null, profile)
})
passport.deserializeUser(function (user, done) {
  done(null, user)
})

module.exports = passport
