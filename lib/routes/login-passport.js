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
  const loginSuccess = (req, res, user) => {
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
  const loginFailure = (req, res) => {
    req.flash('warningMessage', 'Sign in failure.');
    return res.redirect('/login');
  };


  const loginWithLdap = (req, res, next) => {
    const loginForm = req.body.loginForm;

    if (!req.form.isValid) {
      return res.render('login', {
      });
    }

    passport.authenticate('ldapauth', (err, user, info) => {
      debug('---authentication with LdapStrategy start---');
      debug('user', user);
      debug('info', info);

      if (err) { return next(err); }
      if (!user) { return next(); }
      req.logIn(user, (err) => {
        if (err != null) {
          debug(err);
          return next();
        }
        return loginSuccess(req, res, user);
      });

      debug('---authentication with LdapStrategy end---');
    })(req, res, next);
  }

  /**
   * login with LocalStrategy action
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
      debug('---authentication with LocalStrategy start---');
      debug('user', user);
      debug('info', info);

      if (err) { return next(err); }
      if (!user) { return next(); }
      req.logIn(user, (err) => {
        if (err != null) {
          debug(err);
          return next();
        }
        return loginSuccess(req, res, user);
      });

      debug('---authentication with LocalStrategy end---');
    })(req, res, next);
  }

  return {
    loginFailure,
    loginWithLdap,
    loginWithLocal,
  };
};
