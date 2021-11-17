import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';
import { withUnstatedContainers } from './UnstatedUtils';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';

const logger = loggerFactory('growi:completeUserRegistration');


const CompleteUserRegistrationForm = (props) => {
  const {
    t,
    appContainer,
    messageWarnings,
    messageErrors,
    inputs,
    email,
    token,
  } = props;

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [disableForm, setDisableForm] = useState(false);

  async function submitRegistration() {
    setDisableForm(true);
    try {
      const res = await appContainer.apiv3.post('/complete-registration', {
        username, name, password, token,
      });
      toastSuccess('Registration succeed');
      window.location = '/login';
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
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <p className="form-text text-red">
            <span id="help-block-username"></span>
          </p>

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
            <input type="hidden" name="_csrf" value={appContainer.csrfToken} />
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

const CompleteUserRegistrationFormWrapper = withUnstatedContainers(CompleteUserRegistrationForm, [AppContainer]);

CompleteUserRegistrationForm.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  messageWarnings: PropTypes.any,
  messageErrors: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  inputs: PropTypes.any,
  email: PropTypes.any.isRequired,
  token: PropTypes.any.isRequired,
};

export default withTranslation()(CompleteUserRegistrationFormWrapper);
