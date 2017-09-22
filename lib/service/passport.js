const debug = require('debug')('crowi:PassportService');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/**
 * the service class of Passport
 */
class PassportService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * setup LocalStrategy
   *
   * @memberof PassportService
   */
  setupLocalStrategy() {
    const User = this.crowi.model('User');

    passport.use(new LocalStrategy(
      {
        // see '/lib/form/login.js'
        usernameField: 'loginForm[username]',
        passwordField: 'loginForm[password]'
      },
      (username, password, done) => {
        // find user
        User.findUserByUsernameOrEmail(username, password, (err, user) => {
          if (err) { return done(err); }
          // check existence and password
          if (!user || !user.isPasswordValid(password)) {
            return done(null, false, { message: 'Incorrect credentials.' });
          }
          return done(null, user);
        });
      }
    ));
  }

  /**
   * setup serializer and deserializer
   *
   * @memberof PassportService
   */
  setupSerializer() {
    const User = this.crowi.model('User');

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });
  }
}

module.exports = PassportService;
