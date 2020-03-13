
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';
import { toastSuccess, toastError } from '../../util/apiNotification';
import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

class DisassociateModal extends React.Component {

  constructor(props) {
    super(props);

    this.onClickDisassociateBtn = this.onClickDisassociateBtn.bind(this);
  }

  async onClickDisassociateBtn() {
    const { t, personalContainer } = this.props;

    try {
      await personalContainer.disassociateLdapAccount();
      this.props.onClose();
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, accountForDisassociate } = this.props;
    const { providerType, accountId } = accountForDisassociate;

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header className="bg-info" closeButton>
          <Modal.Title className="text-white">
            {t('personal_settings.disassociate_external_account')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('personal_settings.disassociate_external_account_desc', { providerType, accountId }) }} />
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-sm btn-default" onClick={this.props.onClose}>
            { t('Cancel') }
          </button>
          <button type="button" className="btn btn-sm btn-danger" onClick={this.onClickDisassociateBtn}>
            <i className="ti-unlink"></i>
            { t('Disassociate') }
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

}

const DisassociateModalWrapper = (props) => {
  return createSubscribedElement(DisassociateModal, props, [AppContainer, PersonalContainer]);
};

DisassociateModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  accountForDisassociate: PropTypes.object.isRequired,

};


export default withTranslation()(DisassociateModalWrapper);
