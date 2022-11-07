import React, { useState, useEffect, useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
import { UserActivationErrorCode } from '~/interfaces/errors/user-activation';

import { toastSuccess, toastError } from '../client/util/apiNotification';

import { CompleteUserRegistration } from './CompleteUserRegistration';

interface Props {
  email: string,
  token: string,
  errorCode?: UserActivationErrorCode,
  registrationMode: string,
  isEmailAuthenticationEnabled: boolean,
}

const CompleteUserRegistrationForm: React.FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const {
    email,
    token,
    errorCode,
    registrationMode,
    isEmailAuthenticationEnabled,
  } = props;

  const forceDisableForm = errorCode != null || !isEmailAuthenticationEnabled;

  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [disableForm, setDisableForm] = useState(forceDisableForm);
  const [isSuccessToRagistration, setIsSuccessToRagistration] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async() => {
      try {
        const { data } = await apiv3Get('/check-username', { username });
        if (data.ok) {
          setUsernameAvailable(data.valid);
        }
      }
      catch (error) {
        toastError(error, 'Error occurred when checking username');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  const handleSubmitRegistration = useCallback(async(e) => {
    e.preventDefault();
    setDisableForm(true);
    try {
      await apiv3Post('/complete-registration', {
        username, name, password, token,
      });

      toastSuccess('Registration succeed');

      setIsSuccessToRagistration(true);

      if (registrationMode !== 'Restricted') {
        window.location.href = '/login';
      }
    }
    catch (err) {
      toastError(err, 'Registration failed');
      setDisableForm(false);
      setIsSuccessToRagistration(false);
    }
  }, [name, password, token, username, registrationMode]);

  if (isSuccessToRagistration && registrationMode === 'Restricted') {
    return <CompleteUserRegistration />;
  }

  return (
    <>
      <div className="noLogin-dialog mx-auto" id="noLogin-dialog">
        <div className="row mx-0">
          <div className="col-12">

            { (errorCode != null && errorCode === UserActivationErrorCode.TOKEN_NOT_FOUND) && (
              <p className="alert alert-danger">
                <span>Token not found</span>
              </p>
            )}

            { (errorCode != null && errorCode === UserActivationErrorCode.USER_REGISTRATION_ORDER_IS_NOT_APPROPRIATE) && (
              <p className="alert alert-danger">
                <span>{t('message.incorrect_token_or_expired_url')}</span>
              </p>
            )}

            { !isEmailAuthenticationEnabled && (
              <p className="alert alert-danger">
                <span>{t('message.email_authentication_is_not_enabled')}</span>
              </p>
            )}

            <form role="form" onSubmit={handleSubmitRegistration} id="registration-form">
              <input type="hidden" name="token" value={token} />

              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text"><i className="icon-envelope"></i></span>
                </div>
                <input type="text" className="form-control" placeholder={t('Email')} disabled value={email} />
              </div>

              <div className="input-group" id="input-group-username">
                <div className="input-group-prepend">
                  <span className="input-group-text"><i className="icon-user"></i></span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('User ID')}
                  name="username"
                  onChange={e => setUsername(e.target.value)}
                  required
                  disabled={forceDisableForm || disableForm}
                />
              </div>
              {!usernameAvailable && (
                <p className="form-text text-red">
                  <span id="help-block-username"><i className="icon-fw icon-ban"></i>{t('installer.unavaliable_user_id')}</span>
                </p>
              )}

              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text"><i className="icon-tag"></i></span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('Name')}
                  name="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={forceDisableForm || disableForm}
                />
              </div>

              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text"><i className="icon-lock"></i></span>
                </div>
                <input
                  type="password"
                  className="form-control"
                  placeholder={t('Password')}
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={forceDisableForm || disableForm}
                />
              </div>

              <div className="input-group justify-content-center d-flex mt-5">
                <button disabled={forceDisableForm || disableForm} className="btn btn-fill" id="register">
                  <div className="eff"></div>
                  <span className="btn-label"><i className="icon-user-follow"></i></span>
                  <span className="btn-label-text">{t('Create')}</span>
                </button>
              </div>

              <div className="input-group mt-5 d-flex justify-content-center">
                <a href="https://growi.org" className="link-growi-org">
                  <span className="growi">GROWI</span>.<span className="org">ORG</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );

};

export default CompleteUserRegistrationForm;
