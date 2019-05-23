/* eslint-disable no-use-before-define */

module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:login-passport');
  const logger = require('@alias/logger')('growi:routes:login-passport');
  const passport = require('passport');
  const { URL } = require('url');
  const ExternalAccount = crowi.model('ExternalAccount');
  const passportService = crowi.passportService;

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

    const jumpTo = req.session.jumpTo;
    if (jumpTo) {
      req.session.jumpTo = null;

      // prevention from open redirect
      if (jumpTo.match(/^\/[^/].+$/)) { // only one '/' in the front of jumpTo
        return res.redirect(jumpTo);
      }
      try {
        const redirectUrl = new URL(jumpTo.replace(/^\/+/, ''));
        if (redirectUrl.hostname === req.hostname) {
          return res.redirect(redirectUrl);
        }
      }
      catch (err) {
        return res.redirect('/');
      }
    }

    return res.redirect('/');
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
      if (user._groups.length === 0) {
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
  const loginWithLdap = async(req, res, next) => {
    if (!passportService.isLdapStrategySetup) {
      debug('LdapStrategy has not been set up');
      return next();
    }

    if (!req.form.isValid) {
      debug('invalid form');
      return res.render('login', {
      });
    }

    const providerId = 'ldap';
    const strategyName = 'ldapauth';
    let ldapAccountInfo;

    try {
      ldapAccountInfo = await promisifiedPassportAuthentication(strategyName, req, res);
    }
    catch (err) {
      return next(err);
    }

    // check groups for LDAP
    if (!isValidLdapUserByGroupFilter(ldapAccountInfo)) {
      return next();
    }

    /*
      * authentication success
      */
    // it is guaranteed that username that is input from form can be acquired
    // because this processes after authentication
    const ldapAccountId = passportService.getLdapAccountIdFromReq(req);
    const attrMapUsername = passportService.getLdapAttrNameMappedToUsername();
    const attrMapName = passportService.getLdapAttrNameMappedToName();
    const attrMapMail = passportService.getLdapAttrNameMappedToMail();
    const usernameToBeRegistered = ldapAccountInfo[attrMapUsername];
    const nameToBeRegistered = ldapAccountInfo[attrMapName];
    const mailToBeRegistered = ldapAccountInfo[attrMapMail];
    const userInfo = {
      id: ldapAccountId,
      username: usernameToBeRegistered,
      name: nameToBeRegistered,
      email: mailToBeRegistered,
    };

    const externalAccount = await getOrCreateUser(req, res, userInfo, providerId);
    if (!externalAccount) {
      return next();
    }

    const user = await externalAccount.getPopulatedUser();

    // login
    await req.logIn(user, (err) => {
      if (err) { return next(err) }
      return loginSuccess(req, res, user);
    });
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
      if (res.headersSent) { // dirty hack -- 2017.09.25
        return; //              cz: somehow passport.authenticate called twice when ECONNREFUSED error occurred
      }

      if (err) { // DB Error
        logger.error('LDAP Server Error: ', err);
        return res.json({
          status: 'warning',
          message: 'LDAP Server Error occured.',
          err,
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

      if (err) { // DB Error
        logger.error('Database Server Error: ', err);
        req.flash('warningMessage', 'Database Server Error occured.');
        return next(); // pass and the flash message is displayed when all of authentications are failed.
      }
      if (!user) { return next() }
      req.logIn(user, (err) => {
        if (err) { return next() }

        return loginSuccess(req, res, user);
      });
    })(req, res, next);
  };

  const loginWithGoogle = function(req, res, next) {
    if (!passportService.isGoogleStrategySetup) {
      debug('GoogleStrategy has not been set up');
      req.flash('warningMessage', 'GoogleStrategy has not been set up');
      return next();
    }

    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res);
  };

  const loginPassportGoogleCallback = async(req, res, next) => {
    const providerId = 'google';
    const strategyName = 'google';

    let response;
    try {
      response = await promisifiedPassportAuthentication(strategyName, req, res);
    }
    catch (err) {
      return loginFailure(req, res, next);
    }

    const userInfo = {
      id: response.id,
      username: response.displayName,
      name: `${response.name.givenName} ${response.name.familyName}`,
    };
    const externalAccount = await getOrCreateUser(req, res, userInfo, providerId);
    if (!externalAccount) {
      return loginFailure(req, res, next);
    }

    const user = await externalAccount.getPopulatedUser();

    // login
    req.logIn(user, (err) => {
      if (err) { return next(err) }
      return loginSuccess(req, res, user);
    });
  };

  const loginWithGitHub = function(req, res, next) {
    if (!passportService.isGitHubStrategySetup) {
      debug('GitHubStrategy has not been set up');
      req.flash('warningMessage', 'GitHubStrategy has not been set up');
      return next();
    }

    passport.authenticate('github')(req, res);
  };

  const loginPassportGitHubCallback = async(req, res, next) => {
    const providerId = 'github';
    const strategyName = 'github';

    let response;
    try {
      response = await promisifiedPassportAuthentication(strategyName, req, res);
    }
    catch (err) {
      return loginFailure(req, res, next);
    }

    const userInfo = {
      id: response.id,
      username: response.username,
      name: response.displayName,
    };

    const externalAccount = await getOrCreateUser(req, res, userInfo, providerId);
    if (!externalAccount) {
      return loginFailure(req, res, next);
    }

    const user = await externalAccount.getPopulatedUser();

    // login
    req.logIn(user, (err) => {
      if (err) { return next(err) }
      return loginSuccess(req, res, user);
    });
  };

  const loginWithTwitter = function(req, res, next) {
    if (!passportService.isTwitterStrategySetup) {
      debug('TwitterStrategy has not been set up');
      req.flash('warningMessage', 'TwitterStrategy has not been set up');
      return next();
    }

    passport.authenticate('twitter')(req, res);
  };

  const loginPassportTwitterCallback = async(req, res, next) => {
    const providerId = 'twitter';
    const strategyName = 'twitter';

    let response;
    try {
      response = await promisifiedPassportAuthentication(strategyName, req, res);
    }
    catch (err) {
      return loginFailure(req, res, next);
    }

    const userInfo = {
      id: response.id,
      username: response.username,
      name: response.displayName,
    };

    const externalAccount = await getOrCreateUser(req, res, userInfo, providerId);
    if (!externalAccount) {
      return loginFailure(req, res, next);
    }

    const user = await externalAccount.getPopulatedUser();

    // login
    req.logIn(user, (err) => {
      if (err) { return next(err) }
      return loginSuccess(req, res, user);
    });
  };

  const loginWithSaml = function(req, res, next) {
    if (!passportService.isSamlStrategySetup) {
      debug('SamlStrategy has not been set up');
      req.flash('warningMessage', 'SamlStrategy has not been set up');
      return next();
    }

    passport.authenticate('saml')(req, res);
  };

  const loginPassportSamlCallback = async(req, res) => {
    const providerId = 'saml';
    const strategyName = 'saml';
    const attrMapId = crowi.configManager.getConfig('crowi', 'security:passport-saml:attrMapId');
    const attrMapUsername = crowi.configManager.getConfig('crowi', 'security:passport-saml:attrMapUsername');
    const attrMapMail = crowi.configManager.getConfig('crowi', 'security:passport-saml:attrMapMail');
    const attrMapFirstName = crowi.configManager.getConfig('crowi', 'security:passport-saml:attrMapFirstName') || 'firstName';
    const attrMapLastName = crowi.configManager.getConfig('crowi', 'security:passport-saml:attrMapLastName') || 'lastName';

    let response;
    try {
      response = await promisifiedPassportAuthentication(strategyName, req, res);
    }
    catch (err) {
      return loginFailure(req, res);
    }

    const userInfo = {
      id: response[attrMapId],
      username: response[attrMapUsername],
      email: response[attrMapMail],
    };

    // determine name
    const firstName = response[attrMapFirstName];
    const lastName = response[attrMapLastName];
    if (firstName != null || lastName != null) {
      userInfo.name = `${response[attrMapFirstName]} ${response[attrMapLastName]}`.trim();
    }

    const externalAccount = await getOrCreateUser(req, res, userInfo, providerId);
    if (!externalAccount) {
      return loginFailure(req, res);
    }

    const user = await externalAccount.getPopulatedUser();

    // login
    req.logIn(user, (err) => {
      if (err != null) {
        logger.error(err);
        return loginFailure(req, res);
      }
      return loginSuccess(req, res, user);
    });
  };

  const promisifiedPassportAuthentication = (strategyName, req, res) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(strategyName, (err, response, info) => {
        if (res.headersSent) { // dirty hack -- 2017.09.25
          return; //              cz: somehow passport.authenticate called twice when ECONNREFUSED error occurred
        }

        logger.debug(`--- authenticate with ${strategyName} strategy ---`);

        if (err) {
          logger.error(`'${strategyName}' passport authentication error: `, err);
          reject(err);
        }

        logger.debug('response', response);
        logger.debug('info', info);

        // authentication failure
        if (!response) {
          reject(response);
        }

        resolve(response);
      })(req, res);
    });
  };

  const getOrCreateUser = async(req, res, userInfo, providerId) => {
    // get option
    const isSameUsernameTreatedAsIdenticalUser = crowi.passportService.isSameUsernameTreatedAsIdenticalUser(providerId);
    const isSameEmailTreatedAsIdenticalUser = crowi.passportService.isSameEmailTreatedAsIdenticalUser(providerId);

    try {
      // find or register(create) user
      const externalAccount = await ExternalAccount.findOrRegister(
        providerId,
        userInfo.id,
        userInfo.username,
        userInfo.name,
        userInfo.email,
        isSameUsernameTreatedAsIdenticalUser,
        isSameEmailTreatedAsIdenticalUser,
      );
      return externalAccount;
    }
    catch (err) {
      /* eslint-disable no-else-return */
      if (err.name === 'DuplicatedUsernameException') {
        if (isSameEmailTreatedAsIdenticalUser || isSameUsernameTreatedAsIdenticalUser) {
          // associate to existing user
          debug(`ExternalAccount '${userInfo.username}' will be created and bound to the exisiting User account`);
          return ExternalAccount.associate(providerId, userInfo.id, err.user);
        }

        req.flash('provider-DuplicatedUsernameException', providerId);
        return;
      }
      else if (err.name === 'UserUpperLimitException') {
        req.flash('warningMessage', 'Can not register more than the maximum number of users.');
        return;
      }
      /* eslint-enable no-else-return */
    }
  };

  return {
    loginFailure,
    loginWithLdap,
    testLdapCredentials,
    loginWithLocal,
    loginWithGoogle,
    loginWithGitHub,
    loginWithTwitter,
    loginWithSaml,
    loginPassportGoogleCallback,
    loginPassportGitHubCallback,
    loginPassportTwitterCallback,
    loginPassportSamlCallback,
  };
};
