import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';

import AdminLdapSecurityContainer from '../../../services/AdminLdapSecurityContainer';

class LdapAuthTestModal extends React.Component {

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
              <input className="form-control" name="username" />
            </div>
          </div>
          <div className="row p-3">
            <label htmlFor="password" className="col-xs-3 text-right">{t('Password')}</label>
            <div className="col-xs-6">
              <input className="form-control" type="password" name="password" />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex">

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
