import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../utils/axios';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../client/services/AppContainer';
import { toastSuccess, toastError } from '../client/util/apiNotification';

interface Props {
  appContainer: AppContainer,
  messageErrors?: any,
  inputs?: any,
  email: string,
  token: string,
}

const CompleteUserRegistrationForm: React.FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const {
    appContainer,
    messageErrors,
    email,
    token,
  } = props;

  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkUsername, setCheckUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [disableForm, setDisableForm] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      axios
        .get('/_api/check_username', { params: { username: checkUsername } })
        .then((response) => {
          setUsernameAvailable(response.data.valid);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [checkUsername]);

  async function submitRegistration() {
    setDisableForm(true);
    try {
      const res = await appContainer.apiv3.post('/complete-registration', {
        username: checkUsername, name, password, token,
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
              onChange={e => setCheckUsername(e.target.value)}
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

export default withUnstatedContainers(CompleteUserRegistrationForm, [AppContainer]);
