const debug = require('debug')('crowi:service:PassportService');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const LdapStrategy = require('passport-ldapauth');

/**
 * the service class of Passport
 */
class PassportService {

  // see '/lib/form/login.js'
  static get USERNAME_FIELD() { return 'loginForm[username]' }
  static get PASSWORD_FIELD() { return 'loginForm[password]' }

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
        usernameField: PassportService.USERNAME_FIELD,
        passwordField: PassportService.PASSWORD_FIELD,
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

  /*
   * Asynchronous configuration retrieval
   */
  // setupLdapStrategy() {
  //   var getLDAPConfiguration = function(req, callback) {
  //     var loginForm = req.body.loginForm;

  //     if (!req.form.isValid) {
  //       // TODO handle error
  //     }

  //     var username = loginForm.username;
  //     var password = loginForm.password;

  //     process.nextTick(() => {
  //       var opts = {
  //         usernameField: PassportService.USERNAME_FIELD,
  //         passwordField: PassportService.PASSWORD_FIELD,
  //         server: {
  //           url: 'ldaps://pike.weseek.co.jp',
  //           bindDN: `uid=${username}`,
  //           bindCredentials: password,
  //           searchBase: 'ou=people',
  //           searchFilter: '(uid={{username}})'
  //         }
  //       };

  //       callback(null, opts);
  //     });
  //   };

  //   passport.use(new LdapStrategy(getLDAPConfiguration,
  //     (user, done) => {
  //       debug("LDAP authentication has successed");
  //       return done(null, user);
  //     }
  //   ));
  // }

  setupLdapStrategy() {
    passport.use(new LdapStrategy(
      {
        usernameField: PassportService.USERNAME_FIELD,
        passwordField: PassportService.PASSWORD_FIELD,
        server: {
          url: 'ldaps://localhost',
          bindDN: `cn=...,dc=weseek,dc=co,dc=jp`,
          bindCredentials: 'secret',
          searchBase: 'ou=...,dc=weseek,dc=co,dc=jp',
          searchFilter: '(uid={{username}})'
        }
      },
      (user, done) => {
        debug("LDAP authentication has successed");
        return done(null, user);
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
