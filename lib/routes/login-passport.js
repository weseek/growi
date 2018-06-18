module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('growi:routes:login-passport')
    , logger = require('@alias/logger')('growi:routes:login-passport')
    , passport = require('passport')
    , config = crowi.getConfig()
    , Config = crowi.model('Config')
    , ExternalAccount = crowi.model('ExternalAccount')
    , passportService = crowi.passportService
    ;

  /**
   * success handler
   * @param {*} req
   * @param {*} res
   */
  const loginSuccess = (req, res, user) => {
    // update lastLoginAt
    user.updateLastLoginAt(new Date(), (err, userData) => {
      if (err) {
        logger.error(`updateLastLoginAt dumps error: ${err}`);
        debug(`updateLastLoginAt dumps error: ${err}`);
      }
    });

    var jumpTo = req.session.jumpTo;
    if (jumpTo) {
      req.session.jumpTo = null;
      return res.redirect(jumpTo);
    }
    else {
      return res.redirect('/');
    }
  };

  /**
   * failure handler
   * @param {*} req
   * @param {*} res
   */
  const loginFailure = (req, res, next) => {
    req.flash('errorMessage', 'Sign in failure.');
    return res.redirect('/login');
  };

  /**
   * return true(valid) or false(invalid)
   *
   *  true ... group filter is not defined or the user has one or more groups
   *  false ... group filter is defined and the user has any group
   *
   */
  function isValidLdapUserByGroupFilter(user) {
    let bool = true;
    if (user._groups != null) {
      if (user._groups.length == 0) {
        bool = false;
      }
    }
    return bool;
  }
  /**
   * middleware that login with LdapStrategy
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  const loginWithLdap = (req, res, next) => {
    if (!passportService.isLdapStrategySetup) {
      debug('LdapStrategy has not been set up');
      return next();
    }

    if (!req.form.isValid) {
      debug('invalid form');
      return res.render('login', {
      });
    }

    passport.authenticate('ldapauth', (err, ldapAccountInfo, info) => {
      if (res.headersSent) {  // dirty hack -- 2017.09.25
        return;               // cz: somehow passport.authenticate called twice when ECONNREFUSED error occurred
      }

      debug('--- authenticate with LdapStrategy ---');
      debug('ldapAccountInfo', ldapAccountInfo);
      debug('info', info);

      if (err) {  // DB Error
        logger.error('LDAP Server Error: ', err);
        req.flash('warningMessage', 'LDAP Server Error occured.');
        return next(); // pass and the flash message is displayed when all of authentications are failed.
      }

      // authentication failure
      if (!ldapAccountInfo) { return next() }
      // check groups
      if (!isValidLdapUserByGroupFilter(ldapAccountInfo)) {
        return loginFailure(req, res, next);
      }

      /*
       * authentication success
       */
      // it is guaranteed that username that is input from form can be acquired
      // because this processes after authentication
      const ldapAccountId = passportService.getLdapAccountIdFromReq(req);

      const attrMapUsername = passportService.getLdapAttrNameMappedToUsername();
      const attrMapName = passportService.getLdapAttrNameMappedToName();
      const usernameToBeRegistered = ldapAccountInfo[attrMapUsername];
      const nameToBeRegistered = ldapAccountInfo[attrMapName];

      // find or register(create) user
      ExternalAccount.findOrRegister('ldap', ldapAccountId, usernameToBeRegistered, nameToBeRegistered)
        .catch((err) => {
          if (err.name === 'DuplicatedUsernameException') {
            // get option
            const isSameUsernameTreatedAsIdenticalUser = Config.isSameUsernameTreatedAsIdenticalUser(config, 'ldap');
            if (isSameUsernameTreatedAsIdenticalUser) {
              // associate to existing user
              debug(`ExternalAccount '${ldapAccountId}' will be created and bound to the exisiting User account`);
              return ExternalAccount.associate('ldap', ldapAccountId, err.user);
            }
          }
          throw err;  // throw again
        })
        .then((externalAccount) => {
          return externalAccount.getPopulatedUser();
        })
        .then((user) => {
          // login
          req.logIn(user, (err) => {
            if (err) { return next() }
            else {
              return loginSuccess(req, res, user);
            }
          });
        })
        .catch((err) => {
          if (err.name === 'DuplicatedUsernameException') {
            req.flash('provider-DuplicatedUsernameException', 'LDAP');
            return next();
          }
          else {
            return next(err);
          }
        });

    })(req, res, next);
  };

  /**
   * middleware that test credentials with LdapStrategy
   *
   * @param {*} req
   * @param {*} res
   */
  const testLdapCredentials = (req, res) => {
    if (!passportService.isLdapStrategySetup) {
      debug('LdapStrategy has not been set up');
      return res.json({
        status: 'warning',
        message: 'LdapStrategy has not been set up',
      });
    }

    passport.authenticate('ldapauth', (err, user, info) => {
      if (res.headersSent) {  // dirty hack -- 2017.09.25
        return;               // cz: somehow passport.authenticate called twice when ECONNREFUSED error occurred
      }

      if (err) {  // DB Error
        logger.error('LDAP Server Error: ', err);
        return res.json({
          status: 'warning',
          message: 'LDAP Server Error occured.',
          err
        });
      }
      if (info && info.message) {
        return res.json({
          status: 'warning',
          message: info.message,
          ldapConfiguration: req.ldapConfiguration,
          ldapAccountInfo: req.ldapAccountInfo,
        });
      }
      if (user) {
        // check groups
        if (!isValidLdapUserByGroupFilter(user)) {
          return res.json({
            status: 'warning',
            message: 'The user is found, but that has no groups.',
            ldapConfiguration: req.ldapConfiguration,
            ldapAccountInfo: req.ldapAccountInfo,
          });
        }
        return res.json({
          status: 'success',
          message: 'Successfully authenticated.',
          ldapConfiguration: req.ldapConfiguration,
          ldapAccountInfo: req.ldapAccountInfo,
        });
      }
    })(req, res, () => {});
  };

  /**
   * middleware that login with LocalStrategy
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  const loginWithLocal = (req, res, next) => {
    if (!req.form.isValid) {
      return res.render('login', {
      });
    }

    passport.authenticate('local', (err, user, info) => {
      debug('--- authenticate with LocalStrategy ---');
      debug('user', user);
      debug('info', info);

      if (err) {  // DB Error
        logger.error('Database Server Error: ', err);
        req.flash('warningMessage', 'Database Server Error occured.');
        return next(); // pass and the flash message is displayed when all of authentications are failed.
      }
      if (!user) { return next() }
      req.logIn(user, (err) => {
        if (err) { return next() }
        else {
          return loginSuccess(req, res, user);
        }
      });
    })(req, res, next);
  };

  const loginPassportGoogle = function(req, res) {
    if (!passportService.isGoogleStrategySetup) {
      debug('GoogleStrategy has not been set up');
      return;
    }

    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res);
  };

  const loginPassportGoogleCallback = async function(req, res, next) {
    const provider = 'google';
    const response = await __promisifiedPassportAuthentication(req, res, provider);
    let externalAccount;

    try {
      externalAccount = await ExternalAccount.findOrRegister(
        provider,
        response.id,
        response.displayName,
        `${response.name.givenName} ${response.name.familyName}`
      );
    }
    catch (err) {
      if (err.name === 'DuplicatedUsernameException') {
        // get option
        const isSameUsernameTreatedAsIdenticalUser = Config.isSameUsernameTreatedAsIdenticalUser(config, provider);
        if (isSameUsernameTreatedAsIdenticalUser) {
          // associate to existing user
          debug(`ExternalAccount '${response.displayName}' will be created and bound to the exisiting User account`);
          return ExternalAccount.associate(provider, response.id, err.user);
        }
        else {
          req.flash('provider-DuplicatedUsernameException', provider);
          return next();
        }
      }
    }

    const user = await externalAccount.getPopulatedUser();

    // login
    await req.logIn(user, err => {
      if (err) { return next(err) };
      return loginSuccess(req, res, user);
    });
  };

  const __promisifiedPassportAuthentication = (req, res, provider) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(provider, (err, user, info) => {
        if (err) reject(err);
        if (user) resolve(user);
      })(req, res);
    });
  };

  return {
    loginFailure,
    loginWithLdap,
    testLdapCredentials,
    loginWithLocal,
    loginPassportGoogle,
    loginPassportGoogleCallback,
  };
};
