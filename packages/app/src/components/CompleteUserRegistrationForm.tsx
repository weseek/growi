import React, { useState, useEffect } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import axios from '~/utils/axios';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';

interface Props {
  t: any, //  i18next
  appContainer: AppContainer,
  messageWarnings?: any,
  messageErrors?: any,
  inputs?: any,
  email: string,
  token: string,
}

const CompleteUserRegistrationForm: React.FC<Props & WithTranslation> = (props: Props) => {

  const {
    t,
    appContainer,
    messageWarnings,
    messageErrors,
    inputs,
    email,
    token,
  } = props;

  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkUsername, setCheckUsername] = useState('');

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

        <form role="form" action="/user-activation/complete-registartion" method="post" id="registration-form">
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
              value={inputs.username}
              onChange={e => setCheckUsername(e.target.value)}
              required
            />
          </div>
          {!usernameAvailable && (
            <p className="form-text text-red">
              <span id="help-block-username"><i className="icon-fw icon-ban"></i>このユーザーIDは利用できません。</span>
            </p>
          )}

          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text"><i className="icon-tag"></i></span>
            </div>
            <input type="text" className="form-control" placeholder={t('Name')} name="name" value={inputs.name} required />
          </div>

          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text"><i className="icon-lock"></i></span>
            </div>
            <input type="password" className="form-control" placeholder={t('Password')} name="password" required />
          </div>

          <div className="input-group justify-content-center d-flex mt-5">
            <input type="hidden" name="_csrf" value={appContainer.csrfToken} />
            <button type="submit" className="btn btn-fill" id="register">
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
    </>
  );

};

const CompleteUserRegistrationFormWrapper = withUnstatedContainers(CompleteUserRegistrationForm, [AppContainer]);

export default withTranslation()(CompleteUserRegistrationFormWrapper);
