import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.renderLocalOrLdapLoginForm = this.renderLocalOrLdapLoginForm.bind(this);
    this.renderExternalAuthLoginForm = this.renderExternalAuthLoginForm.bind(this);
    this.renderExternalAuthInput = this.renderExternalAuthInput.bind(this);
  }

  renderLocalOrLdapLoginForm() {
    const { t, isLdapStrategySetup } = this.props;

    return (
      <form className="col-12" role="form" action="/login" method="post">

        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text"><i className="icon-user"></i></span>
          </div>
          <input type="text" className="form-control" placeholder="Username or E-mail" name="loginForm[username]" />
          {isLdapStrategySetup && (
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

  // [TODO]
  // onHoverCollapseOnMobile() {
  // if (isExternalAuthCollapsible) {
  //   const isMobile = /iphone|ipad|android/.test(window.navigator.userAgent.toLowerCase());

  //   if (!isMobile) {
  //     $(".collapse-anchor").hover(
  //       function () {
  //         $('.collapse-external-auth').collapse('show');
  //       },
  //       function () {
  //         $('.collapse-external-auth').collapse('hide');
  //       }
  //     );
  //   }
  // }
  // }

  renderExternalAuthLoginForm() {
    const { isLocalStrategySetup, isLdapStrategySetup, isExternalAuthEnabledMap } = this.props;
    const isExternalAuthCollapsible = isLocalStrategySetup || isLdapStrategySetup;
    const collapsibleClass = isExternalAuthCollapsible ? 'collapse collapse-external-auth collapse-anchor' : '';

    return (
      <>
        <div className="border-bottom"></div>
        <div id="external-auth" className={`external-auth ${collapsibleClass}`}>
          <div className="spacer"></div>
          <div className="d-flex flex-row justify-content-between flex-wrap">
            {isExternalAuthEnabledMap.keys().map((auth) => {
              if (isExternalAuthEnabledMap(auth)) {
                return this.renderExternalAuthInput(auth);
              } else {
                return;
              }
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

    const {
      t,
      isRegistrationEnabled,
      isLocalStrategySetup,
      isLdapStrategySetup,
      isExternalAuthEnabledMap,
    } = this.props;

    const isLocalOrLdapStrategiesEnabled = isLocalStrategySetup || isLdapStrategySetup;
    const registerFormClass = isRegistrationEnabled ? 'to-flip' : '';
    const isExternalAuthEnabled = Object.values(isExternalAuthEnabledMap).some(elem => elem);

    return (
      <div className={`login-dialog mx-auto flipper ${registerFormClass}`} id="login-dialog">
        <div className="row">
          <div className="col-12">
            <div className="front">
              { isLocalOrLdapStrategiesEnabled && this.renderLocalOrLdapLoginForm() }
              { isExternalAuthEnabled && this.renderExternalAuthLoginForm() }
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 text-right py-2">
            {isRegistrationEnabled && (
              <a href="#register" id="register" className="link-switch">
                <i className="ti-check-box"></i> { t('Sign up is here') }
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

}

LoginForm.propTypes = {
  // i18next
  t: PropTypes.func.isRequired,
  isRegistrationEnabled: PropTypes.bool,
  isLocalStrategySetup: PropTypes.bool,
  isLdapStrategySetup: PropTypes.bool,
  isExternalAuthEnabledMap: PropTypes.object,
};

export default withTranslation()(LoginForm);
