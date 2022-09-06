import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useCsrfToken } from '~/stores/context';

import { toastError } from '../client/util/apiNotification';


type InvitedFormProps = {
  csrfToken: string,
  // isEmailAuthenticationEnabled: boolean,
  username: string,
  // isRegistering: boolean,
  name: string,
  email: string,
  // isMailerSetup: boolean,

  // isLocalOrLdapStrategiesEnabled: boolean,
  // isSomeExternalAuthEnabled: boolean,
  // isPasswordResetEnabled: boolean,
  // isRegistrationEnabled: boolean,
}

export const InvitedForm = (props: InvitedFormProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: csrfToken } = useCsrfToken();

  const {
    username, name, email,
  } = props;

  const registerAction = '/login/activateInvited';

  // const [usernameAvailable, setUsernameAvailable] = useState(true);

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(async() => {
  //     try {
  //       const { data } = await apiv3Get('/check-username', { username });
  //       if (data.ok) {
  //         setUsernameAvailable(data.valid);
  //       }
  //     }
  //     catch (error) {
  //       toastError(error, 'Error occurred when checking username');
  //     }
  //   }, 500);

  //   return () => clearTimeout(delayDebounceFn);
  // }, [username]);

  // TODO: check flow
  // TODO: check noLoing-dialog
  return (
    <div className="noLogin-dialog p-3 mx-auto" id="noLogin-dialog">
      <p className="alert alert-success">
        <strong>{ t('invited.discription_heading') }</strong><br></br>
        <small>{ t('invited.discription') }</small>
      </p>
      <form role="form" action={registerAction} method="post" id="invited-form">
        {/* Email Form */}
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-envelope"></i>
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            disabled
            placeholder={t('Email')}
            name="invitedForm[email]" // ?
            defaultValue={user.email} // value = user.email
            required
          />
        </div>
        {/* UserID Form */}
        <div className="input-group" id="input-group-username">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-user"></i>
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder={t('User ID')}
            name="invitedForm[username]"
            defaultValue={username} // value =req.body.invitedForm.username
            required
          />
        </div>
        {/* Name Form */}
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-tag"></i>
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder={t('Name')}
            name="invitedForm[name]"
            defaultValue={name} // value = req.body.invitedForm.name
            required
          />
        </div>
        {/* Password Form */}
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-lock"></i>
            </span>
          </div>
          <input
            type="password"
            className="form-control"
            placeholder={t('Password')}
            name="invitedForm[password]"
            required
          />
        </div>
        {/* Create Button */}
        <div className="input-group justify-content-center d-flex mt-5">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <button type="submit" className="btn btn-fill" id="register">
            <div className="eff"></div>
            <span className="btn-label"><i className="icon-user-follow"></i></span>
            <span className="btn-label-text">{t('Create')}</span>
          </button>
        </div>
      </form>
      <div className="input-group mt-5 d-flex justify-content-center">
        <a href="https://growi.org" className="link-growi-org">
          <span className="growi">GROWI</span>.<span className="org">ORG</span>
        </a>
      </div>
    </div>
  );
};
