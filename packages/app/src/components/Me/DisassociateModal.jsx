import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import AppContainer from '~/client/services/AppContainer';
import PersonalContainer from '~/client/services/PersonalContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { useSWRxPersonalExternalAccounts } from '~/stores/personal-settings';

import { withUnstatedContainers } from '../UnstatedUtils';


class DisassociateModal extends React.Component {

  constructor(props) {
    super(props);

    this.onClickDisassociateBtn = this.onClickDisassociateBtn.bind(this);
  }

  async onClickDisassociateBtn() {
    const { t, personalContainer, mutatePersonalExternalAccounts } = this.props;
    const { providerType, accountId } = this.props.accountForDisassociate;

    try {
      await personalContainer.disassociateLdapAccount({ providerType, accountId });
      this.props.onClose();
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }

    if (mutatePersonalExternalAccounts != null) {
      mutatePersonalExternalAccounts();
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

DisassociateModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  accountForDisassociate: PropTypes.object.isRequired,
  mutatePersonalExternalAccounts: PropTypes.func,

};

const DisassociateModalWrapperFC = (props) => {
  const { t } = useTranslation();
  const { mutate: mutatePersonalExternalAccounts } = useSWRxPersonalExternalAccounts();
  return <DisassociateModal t={t} mutatePersonalExternalAccounts={mutatePersonalExternalAccounts} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const DisassociateModalWrapper = withUnstatedContainers(DisassociateModalWrapperFC, [AppContainer, PersonalContainer]);


export default DisassociateModalWrapper;
