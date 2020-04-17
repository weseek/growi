import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.renderLocalOrLdapLoginForm = this.renderLocalOrLdapLoginForm.bind(this);
  }

  renderLocalOrLdapLoginForm() {
    const { t, isLdapStrategySetup } = this.props;

    return (
      <form role="form" action="/login" method="post">

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
          <button type="submit" className="btn btn-fill login px-0 py-2">
            <div className="eff"></div>
            <span className="btn-label p-3"><i className="icon-login"></i></span>
            <span className="btn-label-text p-3">{ t('Sign in') }</span>
          </button>
        </div>

      </form>
    );
  }

  render() {

    const {
      isRegistering,
      isLocalStrategySetup,
      isLdapStrategySetup,
    } = this.props;

    const isLocalOrLdapStrategiesEnabled = isLocalStrategySetup || isLdapStrategySetup;
    const registerFormClass = isRegistering ? 'to-flip' : '';
    return (
      <div className={`login-dialog mx-auto flipper ${registerFormClass}`} id="login-dialog">
        <div className="row">
          <div className="col-md-12">
            { isLocalOrLdapStrategiesEnabled && this.renderLocalOrLdapLoginForm() }
          </div>
        </div>
      </div>
    );
  }

}

LoginForm.propTypes = {
  // i18next
  t: PropTypes.func.isRequired,
  isRegistering: PropTypes.bool,
  isLocalStrategySetup: PropTypes.bool,
  isLdapStrategySetup: PropTypes.bool,
};

export default withTranslation()(LoginForm);
