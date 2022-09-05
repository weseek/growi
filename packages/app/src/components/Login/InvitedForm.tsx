import React from 'react';

import { useTranslation } from 'next-i18next';
import ReactCardFlip from 'react-card-flip';

import { useCsrfToken } from '~/stores/context';

type InvitedFormProps = {
  csrfToken: string,
  isEmailAuthenticationEnabled: boolean,
  username: string,
  isRegistering: boolean,
  name: string,
  email: string,
  isMailerSetup: boolean,

  isLocalOrLdapStrategiesEnabled: boolean,
  isSomeExternalAuthEnabled: boolean,
  isPasswordResetEnabled: boolean,
  isRegistrationEnabled: boolean,
}

export const InvitedForm = (props: InvitedFormProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: csrfToken } = useCsrfToken();

  const {
    isEmailAuthenticationEnabled, username, name, email, isMailerSetup,
  } = props;

  const registerAction = '/login/activateInvited';
  const submitText = t('Sign up');

  // TODO: i18n, checkcsrfToken
  return (
    <div className="col-md-12">
      <div className="noLogin-dialog mx-auto" id="noLogin-dialog">
        <div className="row mx-0">
          <div className="col-12">
            <p className="alert alert-success">
              <strong>アカウントの作成</strong><br></br>
              <small>招待を受け取ったメールアドレスでアカウントを作成します</small>
            </p>
            <form role="form" action={registerAction} method="post" id="register-form">
              {!isEmailAuthenticationEnabled && (
                <div>
                  <div className="input-group" id="input-group-username">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-user"></i>
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control rounded-0"
                      placeholder={t('User ID')}
                      name="registerForm[username]"
                      defaultValue={username}
                      required
                    />
                  </div>
                  <p className="form-text text-danger">
                    <span id="help-block-username"></span>
                  </p>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-tag"></i>
                      </span>
                    </div>
                    <input type="text" className="form-control rounded-0" placeholder={t('Name')} name="registerForm[name]" defaultValue={name} required />
                  </div>
                </div>
              )}
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="icon-envelope"></i>
                  </span>
                </div>
                <input type="email" className="form-control rounded-0" placeholder={t('Email')} name="registerForm[email]" defaultValue={email} required />
              </div>
              {!isEmailAuthenticationEnabled && (
                <div>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-lock"></i>
                      </span>
                    </div>
                    <input type="password" className="form-control rounded-0" placeholder={t('Password')} name="registerForm[password]" required />
                  </div>
                </div>
              )}
              <div className="input-group justify-content-center my-4">
                <input type="hidden" name="_csrf" value={csrfToken} />
                <button type="submit" className="btn btn-fill rounded-0" id="register" disabled={(!isMailerSetup && isEmailAuthenticationEnabled)}>
                  <div className="eff"></div>
                  <span className="btn-label">
                    <i className="icon-user-follow"></i>
                  </span>
                  <span className="btn-label-text">{submitText}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="input-group mt-5 d-flex justify-content-center">
          <a href="https://growi.org" className="link-growi-org">
            <span className="growi">GROWI</span>.<span className="org">ORG</span>
          </a>
        </div>
      </div>
    </div>
  );
};
