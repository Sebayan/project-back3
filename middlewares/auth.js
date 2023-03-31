const passport = require('passport')
const { Strategy } = require('passport-local')
const LocalStrategy = require('passport-local').Strategy

const { logger, loggererr } = require('../log/logger')

const { users } = require('../class/userContainer')


passport.use('login', new LocalStrategy(
  async ( username, password, done ) => {
    const validateUser = await users.checkUser( username, password )
    if ( validateUser.result ) {     
      return done( null, { username: username } )
    } else {
      logger.info(`Usuario o contrasena incorrectos.`)
      return done( null, false )
    }
  }
))


passport.use('register', new LocalStrategy(
  async ( username, password, done ) => {
    if ( await users.userInDb (username) ) {
      logger.info(`Se intento registrar un usuario ya existente`)
      return done( null, false )   
    } else {
      return done( null, { username: username } )
    }
  }
))


passport.serializeUser(function(user, done) {
  done(null, user.username)
})

passport.deserializeUser(function(username, done) {
  done(null, { username: username })
})