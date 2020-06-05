
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
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
    const { providerType, accountId } = this.props.accountForDisassociate;

    try {
      await personalContainer.disassociateLdapAccount({ providerType, accountId });
      this.props.onClose();
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }
    try {
      await personalContainer.retrieveExternalAccounts();
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, accountForDisassociate } = this.props;
    const { providerType, accountId } = accountForDisassociate;

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose}>
        <ModalHeader className="bg-info text-light" toggle={this.props.onClose}>
          {t('personal_settings.disassociate_external_account')}
        </ModalHeader>
        <ModalBody>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('personal_settings.disassociate_external_account_desc', { providerType, accountId }) }} />
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={this.props.onClose}>
            { t('Cancel') }
          </button>
          <button type="button" className="btn btn-sm btn-danger" onClick={this.onClickDisassociateBtn}>
            <i className="ti-unlink"></i>
            { t('Disassociate') }
          </button>
        </ModalFooter>
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
