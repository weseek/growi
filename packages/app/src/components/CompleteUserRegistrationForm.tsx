import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';

import { toastSuccess, toastError } from '../client/util/apiNotification';

interface Props {
  messageErrors?: any,
  inputs?: any,
  email: string,
  token: string,
}

const CompleteUserRegistrationForm: React.FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const {
    messageErrors,
    email,
    token,
  } = props;

  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [disableForm, setDisableForm] = useState(false);

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

  async function submitRegistration() {
    setDisableForm(true);
    try {
      await apiv3Post('/complete-registration', {
        username, name, password, token,
      });
      toastSuccess('Registration succeed');
      window.location.href = '/login';
    }
    catch (err) {
      toastError(err, 'Registration failed');
      setDisableForm(false);
    }
  }

  return (
    <>
      <div id="register-form-errors">
        {messageErrors && (
          <div className="alert alert-danger">
            { messageErrors }
          </div>
        )}
      </div>
      <div id="register-dialog">

        <fieldset id="registration-form" disabled={disableForm}>
          <input type="hidden" name="token" value={token} />
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text"><i className="icon-envelope"></i></span>
            </div>
            <input type="text" className="form-control" disabled value={email} />
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
            />
          </div>

          <div className="input-group justify-content-center d-flex mt-5">
            <button type="button" onClick={submitRegistration} className="btn btn-fill" id="register">
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

        </fieldset>
      </div>
    </>
  );

};

export default CompleteUserRegistrationForm;
