const debug = require('debug')('growi:service:PassportService');
const urljoin = require('url-join');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const LdapStrategy = require('passport-ldapauth');
const GoogleStrategy = require('passport-google-auth').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const OidcStrategy = require('openid-client').Strategy;
const SamlStrategy = require('passport-saml').Strategy;
const OIDCIssuer = require('openid-client').Issuer;
const BasicStrategy = require('passport-http').BasicStrategy;

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
     * the flag whether GoogleStrategy is set up successfully
     */
    this.isGoogleStrategySetup = false;

    /**
     * the flag whether GitHubStrategy is set up successfully
     */
    this.isGitHubStrategySetup = false;

    /**
     * the flag whether TwitterStrategy is set up successfully
     */
    this.isTwitterStrategySetup = false;

    /**
     * the flag whether OidcStrategy is set up successfully
     */
    this.isOidcStrategySetup = false;

    /**
     * the flag whether SamlStrategy is set up successfully
     */
    this.isSamlStrategySetup = false;

    /**
     * the flag whether BasicStrategy is set up successfully
     */
    this.isBasicStrategySetup = false;

    /**
     * the flag whether serializer/deserializer are set up successfully
     */
    this.isSerializerSetup = false;

    /**
     * the keys of mandatory configs for SAML
     */
    this.mandatoryConfigKeysForSaml = [
      'security:passport-saml:isEnabled',
      'security:passport-saml:entryPoint',
      'security:passport-saml:issuer',
      'security:passport-saml:cert',
      'security:passport-saml:attrMapId',
      'security:passport-saml:attrMapUsername',
      'security:passport-saml:attrMapMail',
    ];
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
          if (err) { return done(err) }
          // check existence and password
          if (!user || !user.isPasswordValid(password)) {
            return done(null, false, { message: 'Incorrect credentials.' });
          }
          return done(null, user);
        });
      },
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

    passport.use(new LdapStrategy(this.getLdapConfigurationFunc(config, { passReqToCallback: true }),
      (req, ldapAccountInfo, done) => {
        debug('LDAP authentication has succeeded', ldapAccountInfo);

        // store ldapAccountInfo to req
        req.ldapAccountInfo = ldapAccountInfo;

        done(null, ldapAccountInfo);
      }));

    this.isLdapStrategySetup = true;
    debug('LdapStrategy: setup is done');
  }

  /**
   * return attribute name for mapping to username of Crowi DB
   *
   * @returns
   * @memberof PassportService
   */
  getLdapAttrNameMappedToUsername() {
    const config = this.crowi.config;
    return config.crowi['security:passport-ldap:attrMapUsername'] || 'uid';
  }

  /**
   * return attribute name for mapping to name of Crowi DB
   *
   * @returns
   * @memberof PassportService
   */
  getLdapAttrNameMappedToName() {
    const config = this.crowi.config;
    return config.crowi['security:passport-ldap:attrMapName'] || '';
  }

  /**
   * return attribute name for mapping to name of Crowi DB
   *
   * @returns
   * @memberof PassportService
   */
  getLdapAttrNameMappedToMail() {
    const config = this.crowi.config;
    return config.crowi['security:passport-ldap:attrMapMail'] || 'mail';
  }

  /**
   * CAUTION: this method is capable to use only when `req.body.loginForm` is not null
   *
   * @param {any} req
   * @returns
   * @memberof PassportService
   */
  getLdapAccountIdFromReq(req) {
    return req.body.loginForm.username;
  }

  /**
   * Asynchronous configuration retrieval
   * @see https://github.com/vesse/passport-ldapauth#asynchronous-configuration-retrieval
   *
   * @param {object} config
   * @param {object} opts
   * @returns
   * @memberof PassportService
   */
  getLdapConfigurationFunc(config, opts) {
    /* eslint-disable no-multi-spaces */

    // get configurations
    const isUserBind          = config.crowi['security:passport-ldap:isUserBind'];
    const serverUrl           = config.crowi['security:passport-ldap:serverUrl'];
    const bindDN              = config.crowi['security:passport-ldap:bindDN'];
    const bindCredentials     = config.crowi['security:passport-ldap:bindDNPassword'];
    const searchFilter        = config.crowi['security:passport-ldap:searchFilter'] || '(uid={{username}})';
    const groupSearchBase     = config.crowi['security:passport-ldap:groupSearchBase'];
    const groupSearchFilter   = config.crowi['security:passport-ldap:groupSearchFilter'];
    const groupDnProperty     = config.crowi['security:passport-ldap:groupDnProperty'] || 'uid';
    /* eslint-enable no-multi-spaces */

    // parse serverUrl
    // see: https://regex101.com/r/0tuYBB/1
    const match = serverUrl.match(/(ldaps?:\/\/[^/]+)\/(.*)?/);
    if (match == null || match.length < 1) {
      debug('LdapStrategy: serverUrl is invalid');
      return (req, callback) => { callback({ message: 'serverUrl is invalid' }) };
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
    debug(`LdapStrategy: groupSearchBase=${groupSearchBase}`);
    debug(`LdapStrategy: groupSearchFilter=${groupSearchFilter}`);
    debug(`LdapStrategy: groupDnProperty=${groupDnProperty}`);

    return (req, callback) => {
      // get credentials from form data
      const loginForm = req.body.loginForm;
      if (!req.form.isValid) {
        return callback({ message: 'Incorrect credentials.' });
      }

      // user bind
      const fixedBindDN = (isUserBind)
        ? bindDN.replace(/{{username}}/, loginForm.username)
        : bindDN;
      const fixedBindCredentials = (isUserBind) ? loginForm.password : bindCredentials;
      let serverOpt = {
        url,
        bindDN: fixedBindDN,
        bindCredentials: fixedBindCredentials,
        searchBase,
        searchFilter,
        attrMapUsername: this.getLdapAttrNameMappedToUsername(),
        attrMapName: this.getLdapAttrNameMappedToName(),
      };

      if (groupSearchBase && groupSearchFilter) {
        serverOpt = Object.assign(serverOpt, { groupSearchBase, groupSearchFilter, groupDnProperty });
      }

      process.nextTick(() => {
        const mergedOpts = Object.assign({
          usernameField: PassportService.USERNAME_FIELD,
          passwordField: PassportService.PASSWORD_FIELD,
          server: serverOpt,
        }, opts);
        debug('ldap configuration: ', mergedOpts);

        // store configuration to req
        req.ldapConfiguration = mergedOpts;

        callback(null, mergedOpts);
      });
    };
  }

  /**
   * Asynchronous configuration retrieval
   *
   * @memberof PassportService
   */
  setupGoogleStrategy() {
    // check whether the strategy has already been set up
    if (this.isGoogleStrategySetup) {
      throw new Error('GoogleStrategy has already been set up');
    }

    const config = this.crowi.config;
    const Config = this.crowi.model('Config');
    const isGoogleEnabled = Config.isEnabledPassportGoogle(config);

    // when disabled
    if (!isGoogleEnabled) {
      return;
    }

    debug('GoogleStrategy: setting up..');
    passport.use(
      new GoogleStrategy(
        {
          clientId: config.crowi['security:passport-google:clientId'] || process.env.OAUTH_GOOGLE_CLIENT_ID,
          clientSecret: config.crowi['security:passport-google:clientSecret'] || process.env.OAUTH_GOOGLE_CLIENT_SECRET,
          callbackURL: (this.crowi.configManager.getConfig('crowi', 'app:siteUrl') != null)
            ? urljoin(this.crowi.configManager.getSiteUrl(), '/passport/google/callback') // auto-generated with v3.2.4 and above
            : config.crowi['security:passport-google:callbackUrl'] || process.env.OAUTH_GOOGLE_CALLBACK_URI, // DEPRECATED: backward compatible with v3.2.3 and below
          skipUserProfile: false,
        },
        (accessToken, refreshToken, profile, done) => {
          if (profile) {
            return done(null, profile);
          }

          return done(null, false);
        },
      ),
    );

    this.isGoogleStrategySetup = true;
    debug('GoogleStrategy: setup is done');
  }

  /**
   * reset GoogleStrategy
   *
   * @memberof PassportService
   */
  resetGoogleStrategy() {
    debug('GoogleStrategy: reset');
    passport.unuse('google');
    this.isGoogleStrategySetup = false;
  }

  setupGitHubStrategy() {
    // check whether the strategy has already been set up
    if (this.isGitHubStrategySetup) {
      throw new Error('GitHubStrategy has already been set up');
    }

    const config = this.crowi.config;
    const Config = this.crowi.model('Config');
    const isGitHubEnabled = Config.isEnabledPassportGitHub(config);

    // when disabled
    if (!isGitHubEnabled) {
      return;
    }

    debug('GitHubStrategy: setting up..');
    passport.use(
      new GitHubStrategy(
        {
          clientID: config.crowi['security:passport-github:clientId'] || process.env.OAUTH_GITHUB_CLIENT_ID,
          clientSecret: config.crowi['security:passport-github:clientSecret'] || process.env.OAUTH_GITHUB_CLIENT_SECRET,
          callbackURL: (this.crowi.configManager.getConfig('crowi', 'app:siteUrl') != null)
            ? urljoin(this.crowi.configManager.getSiteUrl(), '/passport/github/callback') // auto-generated with v3.2.4 and above
            : config.crowi['security:passport-github:callbackUrl'] || process.env.OAUTH_GITHUB_CALLBACK_URI, // DEPRECATED: backward compatible with v3.2.3 and below
          skipUserProfile: false,
        },
        (accessToken, refreshToken, profile, done) => {
          if (profile) {
            return done(null, profile);
          }

          return done(null, false);
        },
      ),
    );

    this.isGitHubStrategySetup = true;
    debug('GitHubStrategy: setup is done');
  }

  /**
   * reset GitHubStrategy
   *
   * @memberof PassportService
   */
  resetGitHubStrategy() {
    debug('GitHubStrategy: reset');
    passport.unuse('github');
    this.isGitHubStrategySetup = false;
  }

  setupTwitterStrategy() {
    // check whether the strategy has already been set up
    if (this.isTwitterStrategySetup) {
      throw new Error('TwitterStrategy has already been set up');
    }

    const config = this.crowi.config;
    const Config = this.crowi.model('Config');
    const isTwitterEnabled = Config.isEnabledPassportTwitter(config);

    // when disabled
    if (!isTwitterEnabled) {
      return;
    }

    debug('TwitterStrategy: setting up..');
    passport.use(
      new TwitterStrategy(
        {
          consumerKey: config.crowi['security:passport-twitter:consumerKey'] || process.env.OAUTH_TWITTER_CONSUMER_KEY,
          consumerSecret: config.crowi['security:passport-twitter:consumerSecret'] || process.env.OAUTH_TWITTER_CONSUMER_SECRET,
          callbackURL: (this.crowi.configManager.getConfig('crowi', 'app:siteUrl') != null)
            ? urljoin(this.crowi.configManager.getSiteUrl(), '/passport/twitter/callback') // auto-generated with v3.2.4 and above
            : config.crowi['security:passport-twitter:callbackUrl'] || process.env.OAUTH_TWITTER_CALLBACK_URI, // DEPRECATED: backward compatible with v3.2.3 and below
          skipUserProfile: false,
        },
        (accessToken, refreshToken, profile, done) => {
          if (profile) {
            return done(null, profile);
          }

          return done(null, false);
        },
      ),
    );

    this.isTwitterStrategySetup = true;
    debug('TwitterStrategy: setup is done');
  }

  /**
   * reset TwitterStrategy
   *
   * @memberof PassportService
   */
  resetTwitterStrategy() {
    debug('TwitterStrategy: reset');
    passport.unuse('twitter');
    this.isTwitterStrategySetup = false;
  }

  async setupOidcStrategy() {
    // check whether the strategy has already been set up
    if (this.isOidcStrategySetup) {
      throw new Error('OidcStrategy has already been set up');
    }

    const config = this.crowi.config;
    const configManager = this.crowi.configManager;
    const isOidcEnabled = configManager.getConfig('crowi', 'security:passport-oidc:isEnabled');

    // when disabled
    if (!isOidcEnabled) {
      return;
    }

    debug('OidcStrategy: setting up..');

    // setup client
    // extend oidc request timeouts
    OIDCIssuer.defaultHttpOptions = { timeout: 5000 };
    const issuerHost = configManager.getConfig('crowi', 'security:passport-oidc:issuerHost') || process.env.OAUTH_OIDC_ISSUER_HOST;
    const clientId = configManager.getConfig('crowi', 'security:passport-oidc:clientId') || process.env.OAUTH_OIDC_CLIENT_ID;
    const clientSecret = configManager.getConfig('crowi', 'security:passport-oidc:clientSecret') || process.env.OAUTH_OIDC_CLIENT_SECRET;
    const redirectUri = (configManager.getConfig('crowi', 'app:siteUrl') != null)
      ? urljoin(this.crowi.configManager.getSiteUrl(), '/passport/oidc/callback')
      : config.crowi['security:passport-oidc:callbackUrl'] || process.env.OAUTH_OIDC_CALLBACK_URI; // DEPRECATED: backward compatible with v3.2.3 and below
    const oidcIssuer = await OIDCIssuer.discover(issuerHost);
    debug('Discovered issuer %s %O', oidcIssuer.issuer, oidcIssuer.metadata);

    const client = new oidcIssuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUri],
      response_types: ['code'],
    });

    passport.use('oidc', new OidcStrategy({
      client,
      params: { scope: 'openid email profile' },
    },
    ((tokenset, userinfo, done) => {
      if (userinfo) {
        return done(null, userinfo);
      }

      return done(null, false);

    })));

    this.isOidcStrategySetup = true;
    debug('OidcStrategy: setup is done');
  }

  /**
   * reset OidcStrategy
   *
   * @memberof PassportService
   */
  resetOidcStrategy() {
    debug('OidcStrategy: reset');
    passport.unuse('oidc');
    this.isOidcStrategySetup = false;
  }

  setupSamlStrategy() {
    // check whether the strategy has already been set up
    if (this.isSamlStrategySetup) {
      throw new Error('SamlStrategy has already been set up');
    }

    const configManager = this.crowi.configManager;
    const isSamlEnabled = configManager.getConfig('crowi', 'security:passport-saml:isEnabled');

    // when disabled
    if (!isSamlEnabled) {
      return;
    }

    debug('SamlStrategy: setting up..');
    passport.use(
      new SamlStrategy(
        {
          entryPoint: configManager.getConfig('crowi', 'security:passport-saml:entryPoint'),
          callbackUrl: (this.crowi.configManager.getConfig('crowi', 'app:siteUrl') != null)
            ? urljoin(this.crowi.configManager.getSiteUrl(), '/passport/saml/callback') // auto-generated with v3.2.4 and above
            : configManager.getConfig('crowi', 'security:passport-saml:callbackUrl'), // DEPRECATED: backward compatible with v3.2.3 and below
          issuer: configManager.getConfig('crowi', 'security:passport-saml:issuer'),
          cert: configManager.getConfig('crowi', 'security:passport-saml:cert'),
        },
        (profile, done) => {
          if (profile) {
            return done(null, profile);
          }

          return done(null, false);
        },
      ),
    );

    this.isSamlStrategySetup = true;
    debug('SamlStrategy: setup is done');
  }

  /**
   * reset SamlStrategy
   *
   * @memberof PassportService
   */
  resetSamlStrategy() {
    debug('SamlStrategy: reset');
    passport.unuse('saml');
    this.isSamlStrategySetup = false;
  }

  /**
   * return the keys of the configs mandatory for SAML whose value are empty.
   */
  getSamlMissingMandatoryConfigKeys() {
    const missingRequireds = [];
    for (const key of this.mandatoryConfigKeysForSaml) {
      if (this.crowi.configManager.getConfig('crowi', key) === null) {
        missingRequireds.push(key);
      }
    }
    return missingRequireds;
  }

  /**
   * reset BasicStrategy
   *
   * @memberof PassportService
   */
  resetBasicStrategy() {
    debug('BasicStrategy: reset');
    passport.unuse('basic');
    this.isBasicStrategySetup = false;
  }

  /**
   * setup BasicStrategy
   *
   * @memberof PassportService
   */
  setupBasicStrategy() {
    // check whether the strategy has already been set up
    if (this.isBasicStrategySetup) {
      throw new Error('BasicStrategy has already been set up');
    }

    const configManager = this.crowi.configManager;
    const isBasicEnabled = configManager.getConfig('crowi', 'security:passport-basic:isEnabled');

    // when disabled
    if (!isBasicEnabled) {
      return;
    }

    debug('BasicStrategy: setting up..');

    const configId = configManager.getConfig('crowi', 'security:passport-basic:id');
    const configPassword = configManager.getConfig('crowi', 'security:passport-basic:password');

    passport.use(new BasicStrategy(
      (userId, password, done) => {
        if (userId !== configId || password !== configPassword) {
          return done(null, false, { message: 'Incorrect credentials.' });
        }
        return done(null, userId);
      },
    ));

    this.isBasicStrategySetup = true;
    debug('BasicStrategy: setup is done');
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

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
    passport.deserializeUser(async(id, done) => {
      try {
        const user = await User.findById(id).populate(User.IMAGE_POPULATION);
        if (user == null) {
          throw new Error('user not found');
        }
        done(null, user);
      }
      catch (err) {
        done(err);
      }
    });

    this.isSerializerSetup = true;
  }

  isSameUsernameTreatedAsIdenticalUser(providerType) {
    const key = `security:passport-${providerType}:isSameUsernameTreatedAsIdenticalUser`;
    return this.crowi.configManager.getConfig('crowi', key);
  }

  isSameEmailTreatedAsIdenticalUser(providerType) {
    const key = `security:passport-${providerType}:isSameEmailTreatedAsIdenticalUser`;
    return this.crowi.configManager.getConfig('crowi', key);
  }

}

module.exports = PassportService;
