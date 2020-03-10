import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminLdapSecurityContainer from '../../../services/AdminLdapSecurityContainer';

const logger = loggerFactory('growi:security:AdminLdapSecurityContainer');

class LdapAuthTestModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      logs: '',
      errorMessage: null,
      successMessage: null,
    };

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.addLogs = this.addLogs.bind(this);
    this.testLdapCredentials = this.testLdapCredentials.bind(this);
  }

  /**
   * Change username
   */
  onChangeUsername(username) {
    this.setState({ username });
  }

  /**
   * Change password
   */
  onChangePassword(password) {
    this.setState({ password });
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
   * Test ldap auth
   */
  async testLdapCredentials() {
    try {
      const response = await this.props.appContainer.apiPost('/login/testLdap', {
        loginForm: {
          username: this.state.username,
          password: this.state.password,
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

      if (response.ldapConfiguration) {
        const prettified = JSON.stringify(response.ldapConfiguration.server, undefined, 4);
        this.addLogs(`LDAP Configuration : ${prettified}`);
      }
      if (response.ldapAccountInfo) {
        const prettified = JSON.stringify(response.ldapAccountInfo, undefined, 4);
        this.addLogs(`Retrieved LDAP Account : ${prettified}`);
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
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            Test LDAP Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.successMessage != null && <div className="alert alert-success">{this.state.successMessage}</div>}
          {this.state.errorMessage != null && <div className="alert alert-warning">{this.state.errorMessage}</div>}
          <div className="row p-3">
            <label htmlFor="username" className="col-xs-3 text-right">{t('username')}</label>
            <div className="col-xs-6">
              <input
                className="form-control"
                name="username"
                value={this.state.username}
                onChange={(e) => { this.onChangeUsername(e.target.value) }}
              />
            </div>
          </div>
          <div className="row p-3">
            <label htmlFor="password" className="col-xs-3 text-right">{t('Password')}</label>
            <div className="col-xs-6">
              <input
                className="form-control"
                type="password"
                name="password"
                value={this.state.password}
                onChange={(e) => { this.onChangePassword(e.target.value) }}
              />
            </div>
          </div>
          <div>
            <h5>Logs</h5>
            <textarea id="taLogs" className="col-xs-12" rows="4" value={this.state.logs} readOnly />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-default mt-3 col-xs-offset-5 col-xs-2" onClick={this.testLdapCredentials}>Test</button>
        </Modal.Footer>
      </Modal>
    );
  }

}


LdapAuthTestModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminLdapSecurityContainer: PropTypes.instanceOf(AdminLdapSecurityContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const LdapAuthTestModalWrapper = (props) => {
  return createSubscribedElement(LdapAuthTestModal, props, [AppContainer, AdminLdapSecurityContainer]);
};

export default withTranslation()(LdapAuthTestModalWrapper);
