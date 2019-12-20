import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AdminLdapSecurityContainer from '../../../services/AdminLdapSecurityContainer';

const logger = loggerFactory('growi:security:AdminLdapSecurityContainer');

class LdapAuthTestModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
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
   * Test ldap auth
   */
  async testLdapCredentials() {
    try {
      toastSuccess('success');
    }
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
            {t('Test LDAP Account')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
            <textarea id="taLogs" className="col-xs-12" rows="4" readOnly />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-default mt-3 col-xs-offset-5 col-xs-2" onClick={this.testLdapCredentials}>{t('Test')}</button>
        </Modal.Footer>
      </Modal>
    );
  }

}


LdapAuthTestModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminLdapSecurityContainer: PropTypes.instanceOf(AdminLdapSecurityContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const LdapAuthTestModalWrapper = (props) => {
  return createSubscribedElement(LdapAuthTestModal, props, [AdminLdapSecurityContainer]);
};

export default withTranslation()(LdapAuthTestModalWrapper);
