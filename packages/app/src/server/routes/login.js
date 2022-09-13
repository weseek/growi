// disable all of linting
// because this file is a deprecated legacy of Crowi

module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:login');
  const User = crowi.model('User');

  const actions = {};

  actions.error = function(req, res) {
    const reason = req.params.reason;


    let reasonMessage = '';
    if (reason === 'suspended') {
      reasonMessage = 'This account is suspended.';
    }
    else if (reason === 'registered') {
      reasonMessage = 'Wait for approved by administrators.';
    }

    return res.render('login/error', {
      reason,
      reasonMessage,
    });
  };

  actions.preLogin = function(req, res, next) {
    // user has already logged in
    // const { user } = req;
    // if (user != null && user.status === User.STATUS_ACTIVE) {
    //   const { redirectTo } = req.session;
    //   // remove session.redirectTo
    //   delete req.session.redirectTo;
    //   return res.safeRedirect(redirectTo);
    // }

    // // set referer to 'redirectTo'
    // if (req.session.redirectTo == null && req.headers.referer != null) {
    //   req.session.redirectTo = req.headers.referer;
    // }

    next();
  };

  actions.login = function(req, res) {
    if (req.form) {
      debug(req.form.errors);
    }

    return res.render('login', {});
  };

  actions.invited = async function(req, res) {
    if (!req.user) {
      return res.redirect('/login');
    }

    if (req.method === 'POST' && req.form.isValid) {
      const user = req.user;
      const invitedForm = req.form.invitedForm || {};
      const username = invitedForm.username;
      const name = invitedForm.name;
      const password = invitedForm.password;

      // check user upper limit
      const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();
      if (isUserCountExceedsUpperLimit) {
        req.flash('warningMessage', req.t('message.can_not_activate_maximum_number_of_users'));
        return res.redirect('/invited');
      }

      const creatable = await User.isRegisterableUsername(username);
      if (creatable) {
        try {
          await user.activateInvitedUser(username, name, password);
          return res.redirect('/');
        }
        catch (err) {
          req.flash('warningMessage', req.t('message.failed_to_activate'));
          return res.render('invited');
        }
      }
      else {
        req.flash('warningMessage', req.t('message.unable_to_use_this_user'));
        debug('username', username);
        return res.render('invited');
      }
    }
    else {
      return res.render('invited');
    }
  };

  actions.updateInvitedUser = function(req, res) {
    return res.redirect('/');
  };

  return actions;
};
