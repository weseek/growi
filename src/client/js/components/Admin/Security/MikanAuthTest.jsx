import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminMikanSecurityContainer from '../../../services/AdminMikanSecurityContainer';

const logger = loggerFactory('growi:security:AdminMikanSecurityContainer');

class MikanAuthTest extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      logs: '',
      errorMessage: null,
      successMessage: null,
    };

    this.addLogs = this.addLogs.bind(this);
    this.testMikanCredentials = this.testMikanCredentials.bind(this);
  }

  /**
   * add logs
   */
  addLogs(log) {
    const newLog = `${new Date()} - ${log}\n\n`;
    this.setState({
      logs: `${newLog}${this.state.logs}`,
    });
  }

  /**
   * Test mikan auth
   */
  async testMikanCredentials() {
    try {
      const response = await this.props.appContainer.apiPost('/login/testMikan', {
        loginForm: {
          username: this.props.username,
          password: this.props.password,
        },
      });

      // add logs
      if (response.err) {
        toastError(response.err);
        this.addLogs(response.err);
      }

      if (response.status === 'warning') {
        this.addLogs(response.message);
        this.setState({ errorMessage: response.message, successMessage: null });
      }

      if (response.status === 'success') {
        toastSuccess(response.message);
        this.setState({ successMessage: response.message, errorMessage: null });
      }

      if (response.mikanConfiguration) {
        const prettified = JSON.stringify(response.mikanConfiguration.server, undefined, 4);
        this.addLogs(`Mikan Configuration : ${prettified}`);
      }
      if (response.mikanAccountInfo) {
        const prettified = JSON.stringify(response.mikanAccountInfo, undefined, 4);
        this.addLogs(`Retrieved Mikan Account : ${prettified}`);
      }

    }
    // Catch server communication error
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        {this.state.successMessage != null && <div className="alert alert-success">{this.state.successMessage}</div>}
        {this.state.errorMessage != null && <div className="alert alert-warning">{this.state.errorMessage}</div>}
        <div className="form-group row">
          <label htmlFor="username" className="col-3 col-form-label">{t('username')}</label>
          <div className="col-6">
            <input
              className="form-control"
              name="username"
              value={this.props.username}
              onChange={(e) => { this.props.onChangeUsername(e.target.value) }}
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="password" className="col-3 col-form-label">{t('Password')}</label>
          <div className="col-6">
            <input
              className="form-control"
              type="password"
              name="password"
              value={this.props.password}
              onChange={(e) => { this.props.onChangePassword(e.target.value) }}
            />
          </div>
        </div>

        <div className="form-group">
          <label><h5>Logs</h5></label>
          <textarea id="taLogs" className="col" rows="4" value={this.state.logs} readOnly />
        </div>

        <div>
          <button type="button" className="btn btn-outline-secondary offset-5 col-2" onClick={this.testMikanCredentials}>Test</button>
        </div>
      </React.Fragment>

    );
  }

}


MikanAuthTest.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminLdapSecurityContainer: PropTypes.instanceOf(AdminMikanSecurityContainer).isRequired,

  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  onChangeUsername: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
};

const MikanAuthTestWrapper = (props) => {
  return createSubscribedElement(MikanAuthTest, props, [AppContainer, AdminMikanSecurityContainer]);
};

export default withTranslation()(MikanAuthTestWrapper);
