import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { apiv3Delete } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { usePluginDeleteModal } from '~/stores/modal';

import { useSWRxAdminPlugins } from '../../../stores/admin-plugins';


export const PluginDeleteModal: React.FC = () => {

  const { t } = useTranslation('admin');
  const { mutate } = useSWRxAdminPlugins();
  const { data: pluginDeleteModal, close: closePluginDeleteModal } = usePluginDeleteModal();
  const isOpen = pluginDeleteModal?.isOpen;
  const name = pluginDeleteModal?.name;
  const url = pluginDeleteModal?.url;
  const id = pluginDeleteModal?.id;

  const toggleHandler = useCallback(() => {
    closePluginDeleteModal();
  }, [closePluginDeleteModal]);

  const onClickDeleteButtonHandler = useCallback(async() => {
    const reqUrl = `/plugins/${id}/remove`;

    try {
      const res = await apiv3Delete(reqUrl);
      const pluginName = res.data.pluginName;
      closePluginDeleteModal();
      toastSuccess(t('toaster.remove_plugin_success', { pluginName }));
      mutate();
    }
    catch (err) {
      toastError(err);
    }
  }, [id, closePluginDeleteModal, t, mutate]);

  const headerContent = () => {
    return (
      <span>
        {t('plugins.confirm')}
      </span>
    );
  };

  const bodyContent = () => {

    return (
      <div className="card well mt-2 p-2" key={id}>
        <Link href={`${url}`} legacyBehavior>{name}</Link>
      </div>
    );
  };

  const footerContent = () => {
    return (
      <>
        <Button color="danger" onClick={onClickDeleteButtonHandler}>
          {t('Delete')}
        </Button>
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={toggleHandler}>
      <ModalHeader tag="h4" toggle={toggleHandler} className="bg-danger text-light" name={name}>
        {headerContent()}
      </ModalHeader>
      <ModalBody>
        {bodyContent()}
      </ModalBody>
      <ModalFooter>
        {footerContent()}
      </ModalFooter>
    </Modal>
  );
};
