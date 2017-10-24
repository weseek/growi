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

    /**
     * the flag whether LocalStrategy is set up successfully
     */
    this.isLocalStrategySetup = false;

    /**
     * the flag whether LdapStrategy is set up successfully
     */
    this.isLdapStrategySetup = false;

    /**
     * the flag whether serializer/deserializer are set up successfully
     */
    this.isSerializerSetup = false;
  }

  /**
   * reset LocalStrategy
   *
   * @memberof PassportService
   */
  resetLocalStrategy() {
    debug('LocalStrategy: reset');
    passport.unuse('local');
    this.isLocalStrategySetup = false;
  }

  /**
   * setup LocalStrategy
   *
   * @memberof PassportService
   */
  setupLocalStrategy() {
    // check whether the strategy has already been set up
    if (this.isLocalStrategySetup) {
      throw new Error('LocalStrategy has already been set up');
    }

    debug('LocalStrategy: setting up..');

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

    this.isLocalStrategySetup = true;
    debug('LocalStrategy: setup is done');
  }

  /**
   * reset LdapStrategy
   *
   * @memberof PassportService
   */
  resetLdapStrategy() {
    debug('LdapStrategy: reset');
    passport.unuse('ldapauth');
    this.isLdapStrategySetup = false;
  }

  /**
   * Asynchronous configuration retrieval
   *
   * @memberof PassportService
   */
  setupLdapStrategy() {
    // check whether the strategy has already been set up
    if (this.isLdapStrategySetup) {
      throw new Error('LdapStrategy has already been set up');
    }

    const config = this.crowi.config;
    const Config = this.crowi.model('Config');
    const isLdapEnabled = Config.isEnabledPassportLdap(config);

    // when disabled
    if (!isLdapEnabled) {
      return;
    }

    debug('LdapStrategy: setting up..');

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
      debug('LdapStrategy: serverUrl is invalid');
      return;
    }
    const url = match[1];
    const searchBase = match[2] || '';

    debug(`LdapStrategy: url=${url}`);
    debug(`LdapStrategy: searchBase=${searchBase}`);
    debug(`LdapStrategy: isUserBind=${isUserBind}`);
    if (!isUserBind) {
      debug(`LdapStrategy: bindDN=${bindDN}`);
      debug(`LdapStrategy: bindCredentials=${bindCredentials}`);
    }
    debug(`LdapStrategy: searchFilter=${searchFilter}`);

    // Asynchronous configuration retrieval
    const getLDAPConfiguration = (req, callback) => {
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
          server: { url, bindDN, bindCredentials, searchBase, searchFilter }
        };
        debug('ldap configuration: ', opts);
        callback(null, opts);
      });
    };

    passport.use(new LdapStrategy(getLDAPConfiguration,
      (ldapUserInfo, done) => {
        debug("LDAP authentication has successed", ldapUserInfo);

        this.findOrRegisterUserByLdapInfo(ldapUserInfo)
          .then((user) => {
            done(null, user);
          })
          .catch((err) => {
            done(null, false, { message: err });
          });
      }
    ));

    this.isLdapStrategySetup = true;
    debug('LdapStrategy: setup is done');
  }

  findOrRegisterUserByLdapInfo(ldapUserInfo) {
    const User = this.crowi.model('User');
    const ExternalAccount = this.crowi.model('ExternalAccount');

    const accountId = ldapUserInfo['uid'];

    return ExternalAccount.findOne({ providerType: 'ldap', accountId: accountId })
      .then((account) => {
        if (account != null) {
          debug(`LdapStrategy: accountId '${accountId}' is found `, account);
          return account;
        }
        else {
          debug(`LdapStrategy: accountId '${accountId}' is not found, it is going to be registered.`);

          // TODO ensure to be able to select the way to determine username
          const username = ldapUserInfo['uid'];

          return User.createUser('', username, undefined, undefined, undefined)
            .then((user) => {
              return ExternalAccount.create({ providerType: 'ldap', accountId, user: user._id });
            });
        }
      })
      .then((account) => {
        return account.populate('user').execPopulate();
      })
      .then((account) => {
        return account.user;
      });
  }

  /**
   * setup serializer and deserializer
   *
   * @memberof PassportService
   */
  setupSerializer() {
    // check whether the serializer/deserializer have already been set up
    if (this.isSerializerSetup) {
      throw new Error('serializer/deserializer have already been set up');
    }

    debug('setting up serializer and deserializer');

    const User = this.crowi.model('User');

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });

    this.isSerializerSetup = true;
  }

}

module.exports = PassportService;
