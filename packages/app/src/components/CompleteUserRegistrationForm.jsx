import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';

const logger = loggerFactory('growi:completeUserRegistration');

class CompleteUserRegistrationForm extends Component {

  constructor(props) {

    super(props);

    this.state = {
      usernameAvailable: true,
      typingTimeout: 0,
    };

  }

  checkUsername(event) {
    const username = event.target.value;

    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }

    // Wait user to finish type username to prevent too many requests
    this.state.typingTimeout = setTimeout(() => {
      const self = this;
      axios
        .get('/_api/check_username', { params: { username } })
        .then((response) => {
          self.setState({ usernameAvailable: response.data.valid });
        });
    }, 500);
  }

  render() {

    const {
      t,
      appContainer,
      messageWarnings,
      messageErrors,
      inputs,
      email,
      token,
    } = this.props;

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
                onChange={this.checkUsername.bind(this)}
                required
              />
            </div>
            {!this.state.usernameAvailable && (
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
  }

}

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
