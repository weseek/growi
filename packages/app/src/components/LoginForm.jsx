import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import ReactCardFlip from 'react-card-flip';

import { apiv3Post } from '~/client/util/apiv3-client';
import { useCsrfToken } from '~/stores/context';

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRegistering: false,
      username: '',
      name: '',
      email: '',
      password: '',
      registerErrors: [], // array of string
    };

    this.switchForm = this.switchForm.bind(this);
    this.handleLoginWithExternalAuth = this.handleLoginWithExternalAuth.bind(this);
    this.renderLocalOrLdapLoginForm = this.renderLocalOrLdapLoginForm.bind(this);
    this.renderExternalAuthLoginForm = this.renderExternalAuthLoginForm.bind(this);
    this.renderExternalAuthInput = this.renderExternalAuthInput.bind(this);
    this.renderRegisterForm = this.renderRegisterForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleRegisterFormSubmit = this.handleRegisterFormSubmit.bind(this);
    this.resetRegisterErrors = this.resetRegisterErrors.bind(this);

    const { hash } = window.location;
    if (hash === '#register') {
      this.state.isRegistering = true;
    }
  }

  resetRegisterErrors() {
    if (this.state.registerErrors.length === 0) {
      return;
    }
    this.setState({ registerErrors: [] });
  }

  switchForm() {
    this.setState({
      isRegistering: !this.state.isRegistering,
    });
    // reset errors
    this.resetRegisterErrors();
  }

  handleLoginWithExternalAuth(e) {
    const auth = e.currentTarget.id;
    window.location.href = `/passport/${auth}`;
  }

  renderLocalOrLdapLoginForm() {
    const { t, csrfToken, isLdapStrategySetup } = this.props;

    return (
      <form role="form" action="/login" method="post">
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-user"></i>
            </span>
          </div>
          <input type="text" className="form-control rounded-0" data-testid="tiUsernameForLogin" placeholder="Username or E-mail" name="loginForm[username]" />
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
          <input type="password" className="form-control rounded-0" data-testid="tiPasswordForLogin" placeholder="Password" name="loginForm[password]" />
        </div>

        <div className="input-group my-4">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <button type="submit" id="login" className="btn btn-fill rounded-0 login mx-auto" data-testid="btnSubmitForLogin">
            <div className="eff"></div>
            <span className="btn-label">
              <i className="icon-login"></i>
            </span>
            <span className="btn-label-text">{t('Sign in')}</span>
          </button>
        </div>
      </form>
    );
  }

  renderExternalAuthInput(auth) {
    const { t } = this.props;
    const authIconNames = {
      google: 'google',
      github: 'github',
      facebook: 'facebook',
      twitter: 'twitter',
      oidc: 'openid',
      saml: 'key',
      basic: 'lock',
    };

    return (
      <div key={auth} className="col-6 my-2">
        <button type="button" className="btn btn-fill rounded-0" id={auth} onClick={this.handleLoginWithExternalAuth}>
          <div className="eff"></div>
          <span className="btn-label">
            <i className={`fa fa-${authIconNames[auth]}`}></i>
          </span>
          <span className="btn-label-text">{t('Sign in')}</span>
        </button>
        <div className="small text-right">by {auth} Account</div>
      </div>
    );
  }

  renderExternalAuthLoginForm() {
    const { isLocalStrategySetup, isLdapStrategySetup, objOfIsExternalAuthEnableds } = this.props;
    const isExternalAuthCollapsible = isLocalStrategySetup || isLdapStrategySetup;
    const collapsibleClass = isExternalAuthCollapsible ? 'collapse collapse-external-auth' : '';

    return (
      <>
        <div className="grw-external-auth-form border-top border-bottom">
          <div id="external-auth" className={`external-auth ${collapsibleClass}`}>
            <div className="row mt-2">
              {Object.keys(objOfIsExternalAuthEnableds).map((auth) => {
                if (!objOfIsExternalAuthEnableds[auth]) {
                  return;
                }
                return this.renderExternalAuthInput(auth);
              })}
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
  }

  handleChange(e) {
    const inputName = e.target.name;
    const inputValue = e.target.value;
    this.setState({ [inputName]: inputValue });
  }

  async handleRegisterFormSubmit(e) {
    e.preventDefault();

    const { csrfToken } = this.props;
    const {
      username, name, email, password,
    } = this.state;

    const registerForm = {
      username,
      name,
      email,
      password,
      token: csrfToken,
    };
    try {
      const res = await apiv3PostForm('/register', { registerForm });
      const { redirectTo } = res.data;
      // Todo: redirect
      return;
    }
    catch (err) {
    // Execute if error exists
      if (err != null || err.length > 0) {
      this.setState({
          registerErrors: err,
      });
    }
    }
  }

  renderRegisterForm() {
    const {
      t,
      // appContainer,
      csrfToken,
      isEmailAuthenticationEnabled,
      username,
      name,
      email,
      registrationMode,
      registrationWhiteList,
      isMailerSetup,
    } = this.props;

    let registerAction = '/register';

    let submitText = t('Sign up');
    if (isEmailAuthenticationEnabled) {
      registerAction = '/user-activation/register';
      submitText = t('page_register.send_email');
    }

    // register errors set after
    const { registerErrors } = this.state;

    return (
      <React.Fragment>
        {registrationMode === 'Restricted' && (
          <p className="alert alert-warning">
            {t('page_register.notice.restricted')}
            <br />
            {t('page_register.notice.restricted_defail')}
          </p>
        )}
        { (!isMailerSetup && isEmailAuthenticationEnabled) && (
          <p className="alert alert-danger">
            <span>{t('security_settings.Local.please_enable_mailer')}</span>
          </p>
        )}

        {
          registerErrors != null && registerErrors.length > 0 && (
            <p className="alert alert-danger">
              {registerErrors.map((err, index) => {
                return (
                  <span key={index}>
                    {t(`message.${err.message}`)}<br/>
                  </span>
                );
              })}
            </p>
          )
        }

        <form role="form" onSubmit={this.handleRegisterFormSubmit } id="register-form">

          {!isEmailAuthenticationEnabled && (
            <div>
              <div className="input-group" id="input-group-username">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="icon-user"></i>
                  </span>
                </div>
                {/* username */}
                <input
                  type="text"
                  className="form-control rounded-0"
                  onChange={this.handleChange}placeholder={t('User ID')}
                  name="username"
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
                {/* name */}
                <input type="text"
                  className="form-control rounded-0"
                  onChange={this.handleChange}placeholder={t('Name')}
                  name="name"
                  defaultValue={name}
                  required />
              </div>
            </div>
          )}

          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="icon-envelope"></i>
              </span>
            </div>
            {/* email */}
            <input type="email"
              className="form-control rounded-0"
              onChange={this.handleChange}
              placeholder={t('Email')}
              name="email"
              defaultValue={email}
              required
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

          {!isEmailAuthenticationEnabled && (
            <div>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="icon-lock"></i>
                  </span>
                </div>
                {/* Password */}
                <input type="password"
                  className="form-control rounded-0"
                  onChange={this.handleChange}
                  placeholder={t('Password')}
                  name="password"
                  required />
              </div>
            </div>
          )}

          {/* Sign up button (submit) */}
          <div className="input-group justify-content-center my-4">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <button
              className="btn btn-fill rounded-0"
              id="register"
              disabled={(!isMailerSetup && isEmailAuthenticationEnabled)}
            >
              <div className="eff"></div>
              <span className="btn-label">
                <i className="icon-user-follow"></i>
              </span>
              <span className="btn-label-text">{submitText}</span>
            </button>
          </div>
        </form>

        <div className="border-bottom"></div>

        <div className="row">
          <div className="text-right col-12 mt-2 py-2">
            <a href="#login" id="login" className="link-switch" onClick={this.switchForm}>
              <i className="icon-fw icon-login"></i>
              {t('Sign in is here')}
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const {
      t,
      isLocalStrategySetup,
      isLdapStrategySetup,
      isRegistrationEnabled,
      isPasswordResetEnabled,
      objOfIsExternalAuthEnableds,
    } = this.props;


    const isLocalOrLdapStrategiesEnabled = isLocalStrategySetup || isLdapStrategySetup;
    // const isSomeExternalAuthEnabled = Object.values(objOfIsExternalAuthEnableds).some(elem => elem);
    const isSomeExternalAuthEnabled = true;

    return (
      <div className="noLogin-dialog mx-auto" id="noLogin-dialog">
        <div className="row mx-0">
          <div className="col-12">
            <ReactCardFlip isFlipped={this.state.isRegistering} flipDirection="horizontal" cardZIndex="3">
              <div className="front">
                {isLocalOrLdapStrategiesEnabled && this.renderLocalOrLdapLoginForm()}
                {isSomeExternalAuthEnabled && this.renderExternalAuthLoginForm()}
                {isLocalOrLdapStrategiesEnabled && isPasswordResetEnabled && (
                  <div className="text-right mb-2">
                    <a href="/forgot-password" className="d-block link-switch">
                      <i className="icon-key"></i> {t('forgot_password.forgot_password')}
                    </a>
                  </div>
                )}
                {/* Sign up link */}
                {isRegistrationEnabled && (
                  <div className="text-right mb-2">
                    <a href="#register" id="register" className="link-switch" onClick={this.switchForm}>
                      <i className="ti ti-check-box"></i> {t('Sign up is here')}
                    </a>
                  </div>
                )}
              </div>
              <div className="back">
                {/* Register form for /login#register */}
                {isRegistrationEnabled && this.renderRegisterForm()}
              </div>
            </ReactCardFlip>
          </div>
        </div>
        <a href="https://growi.org" className="link-growi-org pl-3">
          <span className="growi">GROWI</span>.<span className="org">ORG</span>
        </a>
      </div>
    );
  }

}

LoginForm.propTypes = {
  // i18next
  t: PropTypes.func.isRequired,
  // appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  csrfToken: PropTypes.string,
  isRegistering: PropTypes.bool,
  username: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  isRegistrationEnabled: PropTypes.bool,
  registrationMode: PropTypes.string,
  registrationWhiteList: PropTypes.array,
  isPasswordResetEnabled: PropTypes.bool,
  isEmailAuthenticationEnabled: PropTypes.bool,
  isLocalStrategySetup: PropTypes.bool,
  isLdapStrategySetup: PropTypes.bool,
  objOfIsExternalAuthEnableds: PropTypes.object,
  isMailerSetup: PropTypes.bool,
};

const LoginFormWrapperFC = (props) => {
  const { t } = useTranslation();
  const { data: csrfToken } = useCsrfToken();

  return <LoginForm t={t} csrfToken={csrfToken} {...props} />;
};

// export default LoginForm;
export default LoginFormWrapperFC;
