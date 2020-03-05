
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

const AssociateModal = (props) => {
  const { t } = props;

  return (
    <Modal show={props.isOpen} onHide={props.onClose}>
      <Modal.Header className="bg-info" closeButton>
        <Modal.Title className="text-white">
          { t('Create External Account') }
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="nav nav-tabs passport-settings" role="tablist">
          <li className="active">
            <a href="#passport-ldap" data-toggle="tab" role="tab"><i className="fa fa-sitemap"></i> LDAP</a>
          </li>
        </ul>

        <div className="tab-content passport-settings m-t-15">
          <div id="passport-ldap" className="tab-pane active" role="tabpanel">
            <div id="formLdapAssociationContainer">
              <div className="clearfix">
                <button type="button" className="btn btn-info pull-right" onClick="associateLdap()">
                  <i className="fa fa-plus-circle" aria-hidden="true"></i>
                  { t('add') }
                </button>
              </div>
            </div>
          </div>
        </div>


      </Modal.Body>

    </Modal>
  );
};

AssociateModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};


export default withTranslation()(AssociateModal);
