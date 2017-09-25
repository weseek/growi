module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routes:login-passport')
    , passport = require('passport')
    , config = crowi.getConfig()
    , Config = crowi.model('Config');

  /**
   * success handler
   * @param {*} req
   * @param {*} res
   */
  function loginSuccess(req, res) {
    debug('loginSuccess called');

    var jumpTo = req.session.jumpTo;
    if (jumpTo) {
      req.session.jumpTo = null;
      return res.redirect(jumpTo);
    } else {
      return res.redirect('/');
    }
  };

  /**
   * failure handler
   * @param {*} req
   * @param {*} res
   */
  const loginFailure = (req, res, next) => {
    req.flash('warningMessage', 'Sign in failure.');
    return res.redirect('/login');
  };

  /**
   * middleware that login with LdapStrategy
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  const loginWithLdap = (req, res, next) => {
    const loginForm = req.body.loginForm;

    if (!req.form.isValid) {
      debug("invalid form");
      return res.render('login', {
      });
    }

    passport.authenticate('ldapauth', (err, user, info) => {
      if (res.headersSent) {  // dirty hack -- 2017.09.25
        return;               // cz: somehow passport.authenticate called twice when ECONNREFUSED error occurred
      }

      debug('--- authenticate with LdapStrategy ---');
      debug('user', user);
      debug('info', info);

      if (err) {  // DB Error
        console.log('An Error occured: ', err);
        return next(err);
      }
      if (!user) { return next(); }
      req.logIn(user, (err) => {
        if (err) { return next(); }
        else {
          return loginSuccess(req, res);
        }
      });
    })(req, res, next);
  }

  /**
   * middleware that login with LocalStrategy
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  const loginWithLocal = (req, res, next) => {
    const loginForm = req.body.loginForm;

    if (!req.form.isValid) {
      return res.render('login', {
      });
    }

    passport.authenticate('local', (err, user, info) => {
      debug('--- authenticate with LocalStrategy ---');
      debug('user', user);
      debug('info', info);

      if (err) {  // DB Error
        console.log('An Error occured: ', err);
        return next(err);
      }
      if (!user) { return next(); }
      req.logIn(user, (err) => {
        if (err) { return next(); }
        else {
          return loginSuccess(req, res);
        }
      });
    })(req, res, next);
  }

  return {
    loginFailure,
    loginWithLdap,
    loginWithLocal,
  };
};
