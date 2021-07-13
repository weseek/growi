import React from 'react';
import PropTypes from 'prop-types';
import ReactCardFlip from 'react-card-flip';

import { withTranslation } from 'react-i18next';

import urljoin from 'url-join';
import AppContainer from '../services/AppContainer';
import { withUnstatedContainers } from './UnstatedUtils';

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRegistering: false,
    };

    this.switchForm = this.switchForm.bind(this);
    this.handleLoginWithExternalAuth = this.handleLoginWithExternalAuth.bind(this);
    this.renderLocalOrLdapLoginForm = this.renderLocalOrLdapLoginForm.bind(this);
    this.renderExternalAuthLoginForm = this.renderExternalAuthLoginForm.bind(this);
    this.renderExternalAuthInput = this.renderExternalAuthInput.bind(this);
    this.renderRegisterForm = this.renderRegisterForm.bind(this);

    const { hash } = window.location;
    if (hash === '#register') {
      this.state.isRegistering = true;
    }
  }

  switchForm() {
    this.setState({ isRegistering: !this.state.isRegistering });
  }

  handleLoginWithExternalAuth(e) {
    const auth = e.currentTarget.id;
    const { csrf } = this.props.appContainer;
    window.location.href = `/passport/${auth}?_csrf=${csrf}`;
  }

  renderLocalOrLdapLoginForm() {
    const { t, appContainer, isLdapStrategySetup } = this.props;

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
          <input type="hidden" name="_csrf" value={appContainer.csrfToken} />
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

  renderRegisterForm() {
    const {
      t,
      appContainer,
      username,
      name,
      email,
      registrationMode,
      registrationWhiteList,
    } = this.props;

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
            <input type="text" className="form-control rounded-0" placeholder={t('User ID')} name="registerForm[username]" defaultValue={username} required />
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

          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="icon-envelope"></i>
              </span>
            </div>
            <input type="email" className="form-control rounded-0" placeholder={t('Email')} name="registerForm[email]" defaultValue={email} required />
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
            <input type="password" className="form-control rounded-0" placeholder={t('Password')} name="registerForm[password]" required />
          </div>

          <div className="input-group justify-content-center my-4">
            <input type="hidden" name="_csrf" value={appContainer.csrfToken} />
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
      objOfIsExternalAuthEnableds,
      appContainer,
    } = this.props;

    const growiUrlHost = appContainer.config.crowi.url;
    const passwordResetRequestPageUrl = urljoin(growiUrlHost, '_api/v3/password');

    const isLocalOrLdapStrategiesEnabled = isLocalStrategySetup || isLdapStrategySetup;
    const isSomeExternalAuthEnabled = Object.values(objOfIsExternalAuthEnableds).some(elem => elem);

    return (
      <div className="login-dialog mx-auto" id="login-dialog">
        <div className="row mx-0">
          <div className="col-12">
            <ReactCardFlip isFlipped={this.state.isRegistering} flipDirection="horizontal" cardZIndex="3">
              <div className="front">
                {isLocalOrLdapStrategiesEnabled && this.renderLocalOrLdapLoginForm()}
                {isSomeExternalAuthEnabled && this.renderExternalAuthLoginForm()}
                {isRegistrationEnabled && (
                <div className="row">
                  <div className="col-12 text-right py-2">
                    <a href={passwordResetRequestPageUrl} id="reset-password" className="d-block link-switch mb-1">
                      <i className="icon-key"></i> {t('forgot_password')}
                    </a>
                    <a href="#register" id="register" className="link-switch" onClick={this.switchForm}>
                      <i className="ti-check-box"></i> {t('Sign up is here')}
                    </a>
                  </div>
                </div>
              )}
              </div>
              <div className="back">
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

/**
 * Wrapper component for using unstated
 */
const LoginFormWrapper = withUnstatedContainers(LoginForm, [AppContainer]);

LoginForm.propTypes = {
  // i18next
  t: PropTypes.func.isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isRegistering: PropTypes.bool,
  username: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  isRegistrationEnabled: PropTypes.bool,
  registrationMode: PropTypes.string,
  registrationWhiteList: PropTypes.array,
  isLocalStrategySetup: PropTypes.bool,
  isLdapStrategySetup: PropTypes.bool,
  objOfIsExternalAuthEnableds: PropTypes.object,
};

export default withTranslation()(LoginFormWrapper);
