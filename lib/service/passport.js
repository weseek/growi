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
    debug('setup LocalStrategy');

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
  setupLdapStrategy() {
    debug('setup LdapStrategy');

    const config = this.crowi.config;

    // get configurations
    const isUserBind      = config.crowi['security:passport-ldap:isUserBind'];
    const serverUrl       = config.crowi['security:passport-ldap:serverUrl'];
    let   bindDN          = config.crowi['security:passport-ldap:bindDN'];
    let   bindCredentials = config.crowi['security:passport-ldap:bindDNPassword'];
    const searchFilter    = config.crowi['security:passport-ldap:searchFilter'] || '(uid={{username}})';

    // parse serverUrl
    // see: https://regex101.com/r/0tuYBB/1
    const match = serverUrl.match(/(ldaps?:\/\/[^\/]+)\/(.*)?/);
    if (match == null || match.length < 1) {
      debug('serverUrl is invalid');
      return;
    }
    const url = match[1];
    const searchBase = match[2] || '';

    debug(`LDAP url:             ${url}`);
    debug(`LDAP searchBase:      ${searchBase}`);
    debug(`LDAP isUserBind:      ${isUserBind}`);
    debug(`LDAP bindDN:          ${bindDN}`);
    debug(`LDAP bindCredentials: ${bindCredentials}`);
    debug(`LDAP searchFilter:    ${searchFilter}`);

    // Asynchronous configuration retrieval
    var getLDAPConfiguration = (req, callback) => {
      // get credentials from form data
      const loginForm = req.body.loginForm;
      if (!req.form.isValid) {
        return callback({ message: 'Incorrect credentials.' });
      }
      const username = loginForm.username;
      const password = loginForm.password;

      // user bind
      if (isUserBind) {
        bindDN = bindDN.replace(/{{username}}/, username);
        bindCredentials = password;
      }

      process.nextTick(() => {
        const opts = {
          usernameField: PassportService.USERNAME_FIELD,
          passwordField: PassportService.PASSWORD_FIELD,
          server: {
            url,
            bindDN,
            bindCredentials,
            searchBase,
            searchFilter,
          }
        };
        debug('ldap configuration: ', opts);
        callback(null, opts);
      });
    };

    passport.use(new LdapStrategy(getLDAPConfiguration,
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
    debug('setup serializer and deserializer');

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
