
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';
import LdapAuthTest from '../Admin/Security/LdapAuthTest';

class AssociateModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
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

  render() {
    const { t } = this.props;

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header className="bg-info" closeButton>
          <Modal.Title className="text-white">
            { t('Create External Account') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="nav nav-tabs passport-settings mb-2" role="tablist">
            <li className="active">
              <a href="#passport-ldap" data-toggle="tab" role="tab"><i className="fa fa-sitemap"></i> LDAP</a>
            </li>
          </ul>
          <LdapAuthTest
            username={this.state.username}
            password={this.state.password}
            onChangeUsername={this.onChangeUsername}
            onChangePassword={this.onChangePassword}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className="tab-content passport-settings mt-5">
            <div id="passport-ldap" className="tab-pane active" role="tabpanel">
              <button type="button" className="btn btn-info pull-right" onClick="associateLdap()">
                <i className="fa fa-plus-circle" aria-hidden="true"></i>
                {t('add')}
              </button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }

}

AssociateModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};


export default withTranslation()(AssociateModal);
