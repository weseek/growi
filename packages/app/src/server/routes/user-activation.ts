import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import path from 'path';
import UserRegistrationOrder from '~/server/models/user-registration-order';

export const form = (req, res): void => {
  const { userRegistrationOrder } = req;
  return res.render('user-activation', { userRegistrationOrder });
};

async function sendEmailToAllAdmins(userData, admins, appTitle, mailService, template, url) {
  const promises = admins.map((admin) => {
    return mailService.send({
      to: admin.email,
      subject: `[${appTitle}:admin] A New User Created and Waiting for Activation`,
      template,
      vars: {
        createdUser: userData,
        admin,
        url,
        appTitle,
      },
    });
  });
}

export const completeRegistrationAction = (crowi) => {
  const User = crowi.model('User');
  const {
    configManager,
    aclService,
    appService,
    mailService,
  } = crowi;

  return async function(req, res) {
    if (req.user != null) {
      return res.redirect('/');
    }

    // config で closed ならさよなら
    if (configManager.getConfig('crowi', 'security:registrationMode') === aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.redirect('/');
    }

    const { userRegistrationOrder } = req;
    const registerForm = req.body;

    const email = userRegistrationOrder.email;
    const name = registerForm.name;
    const username = registerForm.username;
    const password = registerForm.password;

    // email と username の unique チェックする
    User.isRegisterable(email, username, (isRegisterable, errOn) => {
      let isError = false;
      if (!User.isEmailValid(email)) {
        isError = true;
        req.flash('warningMessage', req.t('message.email_address_could_not_be_used'));
      }
      if (!isRegisterable) {
        if (!errOn.username) {
          isError = true;
          req.flash('warningMessage', req.t('message.user_id_is_not_available'));
        }
        if (!errOn.email) {
          isError = true;
          req.flash('warningMessage', req.t('message.email_address_is_already_registered'));
        }
      }
      if (isError) {
        return res.redirect(`/user-activation/${userRegistrationOrder.token}`);
      }

      // Condition to save User directly without email authentication if email authentication disabled
      if (configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled') === true) {
        User.createUserByEmailAndPassword(name, username, email, password, undefined, async(err, userData) => {
          if (err) {
            if (err.name === 'UserUpperLimitException') {
              req.flash('warningMessage', req.t('message.can_not_register_maximum_number_of_users'));
            }
            else {
              req.flash('warningMessage', req.t('message.failed_to_register'));
            }
            return res.redirect(`/user-activation/${userRegistrationOrder.token}`);
          }

          userRegistrationOrder.revokeOneTimeToken();

          if (configManager.getConfig('crowi', 'security:registrationMode') !== aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED) {
            const admins = await User.findAdmins();
            const appTitle = appService.getAppTitle();
            const template = path.join(crowi.localeDir, 'en_US/admin/userWaitingActivation.txt');
            const url = appService.getSiteUrl();

            sendEmailToAllAdmins(userData, admins, appTitle, mailService, template, url);
          }

          req.flash('successMessage', req.t('message.successfully_created', { username: userData.username }));
          res.redirect('/login');
        });
      }
    });
  };
};

export const makeRegistrationEmailToken = async(email, i18n, appUrl, crowi) => {
  const { mailService, localeDir, appService } = crowi;
  const passwordResetOrderData = await UserRegistrationOrder.createUserRegistrationOrder(email);
  const url = new URL(`/user-activation/${passwordResetOrderData.token}`, appUrl);
  const oneTimeUrl = url.href;
  const txtFileName = 'userActivation';

  return mailService.send({
    to: email,
    subject: txtFileName,
    template: path.join(localeDir, `${i18n}/notifications/${txtFileName}.txt`),
    vars: {
      appTitle: appService.getAppTitle(),
      email,
      url: oneTimeUrl,
    },
  });
};

// middleware to handle error
export const handleHttpErrosMiddleware = (error: Error & { code: string }, req: Request, res: Response, next: NextFunction): Promise<RequestHandler> | void => {
  if (error != null) {
    // TODO: GW7335 - make custom view
    return res.render('forgot-password/error', { key: error.code });
  }
  next();
};
