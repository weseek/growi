import React from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


export type DeletePluginModalProps = {
  isShown: boolean,
  name: string,
  url: string,
  cancelToDelete: () => void,
  confirmToDelete: () => void,
}

export const DeletePluginModal = (props: DeletePluginModalProps): JSX.Element => {
  const {
    isShown, name, url, cancelToDelete, confirmToDelete,
  } = props;

  const { t } = useTranslation('admin');

  const headerContent = () => {
    if (isShown === false) {
      return <></>;
    }
    return (
      <span>
        {t('plugins.confirm')}
      </span>
    );
  };

  const bodyContent = () => {
    if (isShown === false) {
      return <></>;
    }

    return (
      <div className="card well comment-body mt-2 p-2">
        <Link href={`${url}`} legacyBehavior>{name}</Link>
      </div>
    );
  };

  const footerContent = () => {
    if (isShown === false) {
      return <></>;
    }
    return (
      <>
        <Button onClick={cancelToDelete}>{t('plugins.cancel')}</Button>
        <Button color="danger" onClick={confirmToDelete}>
          {t('plugins.delete')}
        </Button>
      </>
    );
  };

  return (
    <Modal isOpen={isShown} toggle={cancelToDelete}>
      <ModalHeader tag="h4" toggle={cancelToDelete} className="bg-danger text-light">
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
