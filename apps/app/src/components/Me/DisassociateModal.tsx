import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import Modal from 'reactstrap/es/Modal';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import ModalHeader from 'reactstrap/es/ModalHeader';

import { toastSuccess, toastError } from '~/client/util/toastr';
import { IExternalAccount } from '~/interfaces/external-account';
import { usePersonalSettings, useSWRxPersonalExternalAccounts } from '~/stores/personal-settings';

type Props = {
  isOpen: boolean,
  onClose: () => void,
  accountForDisassociate: IExternalAccount,
}


const DisassociateModal = (props: Props): JSX.Element => {

  const { t } = useTranslation();
  const { mutate: mutatePersonalExternalAccounts } = useSWRxPersonalExternalAccounts();
  const { disassociateLdapAccount } = usePersonalSettings();

  const { providerType, accountId } = props.accountForDisassociate;

  const disassociateAccountHandler = useCallback(async() => {

    try {
      await disassociateLdapAccount({ providerType, accountId });
      props.onClose();
      toastSuccess(t('security_settings.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }

    if (mutatePersonalExternalAccounts != null) {
      mutatePersonalExternalAccounts();
    }
  }, [accountId, disassociateLdapAccount, mutatePersonalExternalAccounts, props, providerType, t]);

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
        <button type="button" className="btn btn-sm btn-danger" onClick={disassociateAccountHandler}>
          <i className="ti ti-unlink"></i>
          { t('Disassociate') }
        </button>
      </ModalFooter>
    </Modal>
  );
};


export default DisassociateModal;
