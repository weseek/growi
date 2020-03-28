import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminMikanSecurityContainer from '../../../services/AdminMikanSecurityContainer';

const logger = loggerFactory('growi:security:AdminMikanSecurityContainer');

class MikanAuthTestModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      logs: '',
      errorMessage: null,
      successMessage: null,
    };

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.addLogs = this.addLogs.bind(this);
    this.testMikanCredentials = this.testMikanCredentials.bind(this);
  }

  /**
   * Change username
   */
  onChangeUsername(username) {
    this.setState({ username });
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
          username: this.state.username,
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
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            Test Mikan Account
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
          <div>
            <h5>Logs</h5>
            <textarea id="taLogs" className="col-xs-12" rows="4" value={this.state.logs} readOnly />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-default mt-3 col-xs-offset-5 col-xs-2" onClick={this.testMikanCredentials}>Test</button>
        </Modal.Footer>
      </Modal>
    );
  }

}


MikanAuthTestModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMikanSecurityContainer: PropTypes.instanceOf(AdminMikanSecurityContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const MikanAuthTestModalWrapper = (props) => {
  return createSubscribedElement(MikanAuthTestModal, props, [AppContainer, AdminMikanSecurityContainer]);
};

export default withTranslation()(MikanAuthTestModalWrapper);
