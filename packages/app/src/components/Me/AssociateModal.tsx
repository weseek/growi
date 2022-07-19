import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { usePersonalSettings, useSWRxPersonalExternalAccounts } from '~/stores/personal-settings';

import LdapAuthTest from '../Admin/Security/LdapAuthTest';

type Props = {
  isOpen: boolean,
  onClose: () => void,
}

const AssociateModal = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { mutate: mutatePersonalExternalAccounts } = useSWRxPersonalExternalAccounts();
  const { associateLdapAccount } = usePersonalSettings();
  const { isOpen, onClose } = props;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const closeModalHandler = useCallback(() => {
    onClose();
    setUsername('');
    setPassword('');
  }, [onClose]);


  const clickAddLdapAccountHandler = useCallback(async() => {
    try {
      await associateLdapAccount({ username, password });
      mutatePersonalExternalAccounts();

      closeModalHandler();
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }

  }, [associateLdapAccount, closeModalHandler, mutatePersonalExternalAccounts, password, t, username]);


  return (
    <Modal isOpen={isOpen} toggle={closeModalHandler} size="lg" data-testid="grw-associate-modal">
      <ModalHeader className="bg-primary text-light" toggle={onClose}>
        { t('admin:user_management.create_external_account') }
      </ModalHeader>
      <ModalBody>
        <ul className="nav nav-tabs passport-settings mb-2" role="tablist">
          <li className="nav-item active">
            <a href="#passport-ldap" className="nav-link active" data-toggle="tab" role="tab">
              <i className="fa fa-sitemap"></i> LDAP
            </a>
          </li>
          <li className="nav-item">
            <a href="#github-tbd" className="nav-link" data-toggle="tab" role="tab">
              <i className="fa fa-github"></i> (TBD) GitHub
            </a>
          </li>
          <li className="nav-item">
            <a href="#google-tbd" className="nav-link" data-toggle="tab" role="tab">
              <i className="fa fa-google"></i> (TBD) Google OAuth
            </a>
          </li>
          <li className="nav-item">
            <a href="#facebook-tbd" className="nav-link" data-toggle="tab" role="tab">
              <i className="fa fa-facebook"></i> (TBD) Facebook
            </a>
          </li>
          <li className="nav-item">
            <a href="#twitter-tbd" className="nav-link" data-toggle="tab" role="tab">
              <i className="fa fa-twitter"></i> (TBD) Twitter
            </a>
          </li>
        </ul>
        <div className="tab-content">
          <div id="passport-ldap" className="tab-pane active">
            <LdapAuthTest
              username={username}
              password={password}
              onChangeUsername={username => setUsername(username)}
              onChangePassword={password => setPassword(password)}
            />
          </div>
          <div id="github-tbd" className="tab-pane" role="tabpanel">TBD</div>
          <div id="google-tbd" className="tab-pane" role="tabpanel">TBD</div>
          <div id="facebook-tbd" className="tab-pane" role="tabpanel">TBD</div>
          <div id="twitter-tbd" className="tab-pane" role="tabpanel">TBD</div>
        </div>
      </ModalBody>
      <ModalFooter className="border-top-0">
        <button type="button" className="btn btn-primary mt-3" onClick={clickAddLdapAccountHandler}>
          <i className="fa fa-plus-circle" aria-hidden="true"></i>
          {t('add')}
        </button>
      </ModalFooter>
    </Modal>
  );
};


export default AssociateModal;
