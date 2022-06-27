import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IExternalAccount } from '~/interfaces/external-account';
import { usePersonalSettings, useSWRxPersonalExternalAccounts } from '~/stores/personal-settings';

type Props = {
  appContainer: AppContainer,
  isOpen: boolean,
  onClose: () => void,
  accountForDisassociate: IExternalAccount,
  mutatePersonalExternalAccounts?: () => void,
  disassociateLdapAccount?: (account: { providerType: string, accountId: string }) => void,
}


const DisassociateModal = (props: Props) => {

  const { t } = useTranslation();
  const { mutate: mutatePersonalExternalAccounts } = useSWRxPersonalExternalAccounts();
  const { disassociateLdapAccount } = usePersonalSettings();

  const { providerType, accountId } = props.accountForDisassociate;

  const onClickDisassociateBtn = async() => {

    try {
      await disassociateLdapAccount({ providerType, accountId });
      props.onClose();
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }

    if (mutatePersonalExternalAccounts != null) {
      mutatePersonalExternalAccounts();
    }
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.onClose}>
      <ModalHeader className="bg-info text-light" toggle={props.onClose}>
        {t('personal_settings.disassociate_external_account')}
      </ModalHeader>
      <ModalBody>
        {/* eslint-disable-next-line react/no-danger */}
        <p dangerouslySetInnerHTML={{ __html: t('personal_settings.disassociate_external_account_desc', { providerType, accountId }) }} />
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={props.onClose}>
          { t('Cancel') }
        </button>
        <button type="button" className="btn btn-sm btn-danger" onClick={onClickDisassociateBtn}>
          <i className="ti-unlink"></i>
          { t('Disassociate') }
        </button>
      </ModalFooter>
    </Modal>
  );
};


export default DisassociateModal;
