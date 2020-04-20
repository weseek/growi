import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.isRegistrationEnabled = false;
    this.isLocalStrategySetup = false;
    this.isLdapStrategySetup = false;
    this.objOfIsExternalAuthEnableds = {};

    this.renderLocalOrLdapLoginForm = this.renderLocalOrLdapLoginForm.bind(this);
    this.renderExternalAuthLoginForm = this.renderExternalAuthLoginForm.bind(this);
    this.renderExternalAuthInput = this.renderExternalAuthInput.bind(this);
  }

  componentWillMount() {
    this.isRegistrationEnabled = true;
    this.isLocalStrategySetup = true;
    this.isLdapStrategySetup = true;
    this.objOfIsExternalAuthEnableds = {
      google: true,
      github: true,
      facebook: true,
      twitter: true,
      oidc: true,
      saml: true,
      basic: true,
    };
  }

  renderLocalOrLdapLoginForm() {
    const { t } = this.props;

    return (
      <form className="col-12" role="form" action="/login" method="post">

        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text"><i className="icon-user"></i></span>
          </div>
          <input type="text" className="form-control" placeholder="Username or E-mail" name="loginForm[username]" />
          {this.isLdapStrategySetup && (
            <div className="input-group-append">
              <small className="input-group-text text-success">
                <i className="icon-fw icon-check"></i> LDAP
              </small>
            </div>
          )}
        </div>

        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text"><i className="icon-lock"></i></span>
          </div>
          <input type="password" className="form-control" placeholder="Password" name="loginForm[password]" />
        </div>

        <div className="input-group justify-content-center d-flex mt-5">
          <input type="hidden" name="_csrf" value="{{ csrf() }}" />
          <button type="submit" id="login" className="btn btn-fill login px-0 py-2">
            <div className="eff"></div>
            <span className="btn-label p-3"><i className="icon-login"></i></span>
            <span className="btn-label-text p-3">{ t('Sign in') }</span>
          </button>
        </div>

      </form>
    );
  }

  renderExternalAuthInput(auth) {
    const { t } = this.props;
    return (
      <div className="input-group justify-content-center d-flex mt-5">
        <form role="form" action={`/passport/${auth}`} className="d-inline-flex flex-column">
          <input type="hidden" name="_csrf" value="{{ csrf() }}" />
          <button type="submit" className="btn btn-fill px-0 py-2" id={auth}>
            <div className="eff"></div>
            <span className="btn-label p-3"><i className={`fa fa-${auth}`}></i></span>
            <span className="btn-label-text p-3">{ t('Sign in') }</span>
          </button>
          <div className="small text-center">by {auth} Account</div>
        </form>
      </div>
    );
  }

  renderExternalAuthLoginForm() {
    const isExternalAuthCollapsible = this.isLocalStrategySetup || this.isLdapStrategySetup;
    const collapsibleClass = isExternalAuthCollapsible ? 'collapse collapse-external-auth collapse-anchor' : '';

    return (
      <>
        <div className="border-bottom"></div>
        <div id="external-auth" className={`external-auth ${collapsibleClass}`}>
          <div className="spacer"></div>
          <div className="d-flex flex-row justify-content-between flex-wrap">
            {Object.keys(this.objOfIsExternalAuthEnableds).map((auth) => {
              if (!this.objOfIsExternalAuthEnableds[auth]) {
                return;
              }
              return this.renderExternalAuthInput(auth);
            })}
          </div>
          <div className="spacer"></div>
        </div>
        <div className="border-bottom"></div>
        <div className="text-center">
          <button
            type="button"
            className="collapse-anchor btn btn-xs btn-collapse-external-auth mb-3"
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

  render() {
    const { t, isRegistering } = this.props;

    const isLocalOrLdapStrategiesEnabled = this.isLocalStrategySetup || this.isLdapStrategySetup;
    const registerFormClass = isRegistering ? 'to-flip' : '';
    const isSomeExternalAuthEnabled = Object.values(this.objOfIsExternalAuthEnableds).some(elem => elem);

    return (
      <div className={`login-dialog mx-auto flipper ${registerFormClass}`} id="login-dialog">
        <div className="row">
          <div className="col-12">
            <div className="front">
              { isLocalOrLdapStrategiesEnabled && this.renderLocalOrLdapLoginForm() }
              { isSomeExternalAuthEnabled && this.renderExternalAuthLoginForm() }
            </div>
            {/* [TODO][GW-1863] render register form here */}
          </div>
        </div>
        {this.isRegistrationEnabled && (
          <div className="row">
            <div className="col-12 text-right py-2">
              <a href="#register" id="register" className="link-switch">
                <i className="ti-check-box"></i> { t('Sign up is here') }
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

}

LoginForm.propTypes = {
  // i18next
  t: PropTypes.func.isRequired,
  isRegistering: PropTypes.bool,
  csrf: PropTypes.string,
};

export default withTranslation()(LoginForm);
