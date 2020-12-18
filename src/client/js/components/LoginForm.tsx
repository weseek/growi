import React, { useState } from 'react';
import { useForm, Validate } from 'react-hook-form';

import ReactCardFlip from 'react-card-flip';

import { useTranslation } from '~/i18n';

import { ErrorV3 } from '~/models/error-v3';

import { useCsrfToken } from '~/stores/context';
import { apiv3Get } from '../util/apiv3-client';

const authIconNames = {
  google: 'google',
  github: 'github',
  facebook: 'facebook',
  twitter: 'twitter',
  oidc: 'openid',
  saml: 'key',
  basic: 'lock',
};

// eslint-disable-next-line react/prop-types
const ExternalAuthInput = ({ auth }) => {
  const { t } = useTranslation();
  const { data: csrfToken } = useCsrfToken();

  const handleLoginWithExternalAuth = () => {
    window.location.href = `/passport/${auth}?_csrf=${csrfToken}`;
  };

  return (
    <div key={auth} className="col-6 my-2">
      <button type="button" className="btn btn-fill rounded-0" id={auth} onClick={handleLoginWithExternalAuth}>
        <div className="eff"></div>
        <span className="btn-label">
          <i className={`fa fa-${authIconNames[auth]}`}></i>
        </span>
        <span className="btn-label-text">{t('Sign in')}</span>
      </button>
      <div className="small text-right">by {auth} Account</div>
    </div>
  );
};


type Props = {
  registrationMode: string,
  isRegistrationEnabled: boolean,
  registrationWhiteList: string[],
  setupedStrategies: string[],
  enabledStrategies: string[],
}

type FormValues = {
  username: string,
  name: string,
  email: string,
  password: string,
}


const LoginForm = (props: Props): JSX.Element => {

  const { t } = useTranslation();
  const { data: csrfToken } = useCsrfToken();
  const { handleSubmit, register } = useForm({ mode: 'onBlur' });

  const [isRegistering, setIsRegistering] = useState(false);
  const [isValidUserName, setIsValidUserName] = useState(true);
  const [serverErrors, setServerErrors] = useState<ErrorV3[]>([]);

  // const { hash } = window.location;
  // if (hash === '#register') {
  //   this.state.isRegistering = true;
  // }

  const {
    isRegistrationEnabled,
    setupedStrategies,
    enabledStrategies,
  } = props;

  const isLocalOrLdapStrategiesEnabled = setupedStrategies.includes('local') || setupedStrategies.includes('ldap');
  const isSomeExternalAuthEnabled = enabledStrategies.length > 0;

  const switchForm = () => setIsRegistering(!isRegistering);

  const validateUsername: Validate = async(value) => {
    try {
      const { data } = await apiv3Get('/users/exists', { username: value });
      const isExists = data.exists;

      if (isExists) {
        setIsValidUserName(false);
        setServerErrors([new ErrorV3(`Username '${value}' exists.`)]);
      }
    }
    catch (errors) {
      setServerErrors(errors);
    }

    // return true as React Hook Form validation
    return true;
  };

  const renderLocalOrLdapLoginForm = (): JSX.Element => {
    const isLdapStrategySetup = props.setupedStrategies.includes('ldap');

    return (
      <form role="form" action="/login" method="post">
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-user"></i>
            </span>
          </div>
          <input type="text" className="form-control rounded-0" placeholder="Username or E-mail" name="loginForm[username]" />
          {isLdapStrategySetup && (
            <div className="input-group-append">
              <small className="input-group-text text-success">
                <i className="icon-fw icon-check"></i> LDAP
              </small>
            </div>
          )}
        </div>

        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-lock"></i>
            </span>
          </div>
          <input type="password" className="form-control rounded-0" placeholder="Password" name="loginForm[password]" />
        </div>

        <div className="input-group my-4">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <button type="submit" id="login" className="btn btn-fill rounded-0 login mx-auto">
            <div className="eff"></div>
            <span className="btn-label">
              <i className="icon-login"></i>
            </span>
            <span className="btn-label-text">{t('Sign in')}</span>
          </button>
        </div>
      </form>
    );
  };

  const renderExternalAuthLoginForm = (): JSX.Element => {
    const { enabledStrategies } = props;

    const isExternalAuthCollapsible = isLocalOrLdapStrategiesEnabled;
    const collapsibleClass = isExternalAuthCollapsible ? 'collapse collapse-external-auth' : '';

    return (
      <>
        <div className="grw-external-auth-form border-top border-bottom">
          <div id="external-auth" className={`external-auth ${collapsibleClass}`}>
            <div className="row mt-2">
              {enabledStrategies.map(auth => <ExternalAuthInput auth={auth} />)}
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-secondary btn-external-auth-tab btn-sm rounded-0 mb-3"
            data-toggle={isExternalAuthCollapsible ? 'collapse' : ''}
            data-target="#external-auth"
            aria-expanded="false"
            aria-controls="external-auth"
          >
            External Auth
          </button>
        </div>
      </>
    );
  };

  const renderRegisterForm = (): JSX.Element => {
    const { registrationMode, registrationWhiteList } = props;

    return (
      <React.Fragment>
        {registrationMode === 'Restricted' && (
          <p className="alert alert-warning">
            {t('page_register.notice.restricted')}
            <br />
            {t('page_register.notice.restricted_defail')}
          </p>
        )}
        <form role="form" action="/register" method="post" id="register-form">
          <div className="input-group" id="input-group-username">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="icon-user"></i>
              </span>
            </div>
            <input
              name="registerForm[username]"
              className="form-control rounded-0"
              placeholder={t('User ID')}
              ref={register({
                validate: async value => validateUsername(value),
              })}
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
            <input
              name="registerForm[name]"
              className="form-control rounded-0"
              placeholder={t('Name')}
              ref={register}
            />
          </div>

          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="icon-envelope"></i>
              </span>
            </div>
            <input
              name="registerForm[email]"
              className="form-control rounded-0"
              placeholder={t('Email')}
              ref={register}
            />
          </div>

          {registrationWhiteList.length > 0 && (
          <>
            <p className="form-text">{t('page_register.form_help.email')}</p>
            <ul>
              {registrationWhiteList.map((elem) => {
                  return (
                    <li key={elem}>
                      <code>{elem}</code>
                    </li>
                  );
                })}
            </ul>
          </>
          )}

          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="icon-lock"></i>
              </span>
            </div>
            <input
              name="registerForm[password]"
              type="password"
              className="form-control rounded-0"
              placeholder={t('Password')}
              ref={register}
            />
          </div>

          <div className="input-group justify-content-center my-4">
            <button type="submit" className="btn btn-fill rounded-0" id="register">
              <div className="eff"></div>
              <span className="btn-label">
                <i className="icon-user-follow"></i>
              </span>
              <span className="btn-label-text">{t('Sign up')}</span>
            </button>
          </div>
        </form>

        <div className="border-bottom"></div>

        <div className="row">
          <div className="text-right col-12 mt-2 py-2">
            <a href="#login" id="login" className="link-switch" onClick={switchForm}>
              <i className="icon-fw icon-login"></i>
              {t('Sign in is here')}
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div className="login-dialog mx-auto" id="login-dialog">
      <div className="row mx-0">
        <div className="col-12">
          <ReactCardFlip isFlipped={isRegistering} flipDirection="horizontal" cardZIndex="3">
            <div className="front">
              {isLocalOrLdapStrategiesEnabled && renderLocalOrLdapLoginForm()}
              {isSomeExternalAuthEnabled && renderExternalAuthLoginForm()}
              {isRegistrationEnabled && (
                <div className="row">
                  <div className="col-12 text-right py-2">
                    <a href="#register" id="register" className="link-switch" onClick={switchForm}>
                      <i className="ti-check-box"></i> {t('Sign up is here')}
                    </a>
                  </div>
                </div>
            )}
            </div>
            <div className="back">
              {isRegistrationEnabled && renderRegisterForm()}
            </div>
          </ReactCardFlip>
        </div>
      </div>
      <a href="https://growi.org" className="link-growi-org pl-3">
        <span className="growi">GROWI</span>.<span className="org">ORG</span>
      </a>
    </div>
  );

};

export default LoginForm;
