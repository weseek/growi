import React, { FC, useState } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useTranslation } from 'react-i18next';
import AppContainer from '../../client/services/AppContainer';
import { toastSuccess } from '../../client/util/apiNotification';


type Props = {
  isOpen: boolean
  onClose: (() => void) | null
  path: string
  pageId: string
  revisionId: string
  appContainer: AppContainer,
}


const PageDeleteOneModal: FC <Props> = (props: Props) => {

  const {
    isOpen, path, pageId, revisionId, appContainer,
  } = props;
  const { t } = useTranslation('');
  const [isDeleteCompletely, setIsDeleteCompletely] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onClose = () => {
    if (props.onClose != null) {
      props.onClose();
    }
  };

  const onDeleteInvoked = () => {
    return new Promise<void>((resolve, reject) => {
      appContainer.apiPost('/pages.remove', { page_id: pageId, revision_id: revisionId, completely: isDeleteCompletely || null })
        .then((res) => {
          if (res.ok) {
            onClose();
            toastSuccess(t('toaster.remove_successed', { target: 'the page' }));
            // TODO: reload or update page list by using state
            // https://estoc.weseek.co.jp/redmine/issues/79786
            return resolve();
          }
          return reject();
        })
        .catch((err) => {
          setErrorMessage(err.message);
          return reject();
        });
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="page-list-delete-modal">
      <ModalHeader tag="h4" toggle={onClose} className="bg-danger text-light">
        {t('search_result.deletion_modal_header')}
      </ModalHeader>
      <ModalBody>
        <p>{path}</p>
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-between">
          {errorMessage.length > 0
            && <span className="text-danger">{errorMessage}</span>
          }
          <span className="d-flex align-items-center">
            <div className="custom-control custom-checkbox custom-checkbox-danger mr-2">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck-delete-completely"
                checked={isDeleteCompletely}
                onChange={() => setIsDeleteCompletely(!isDeleteCompletely)}
              />
              <label
                className="custom-control-label text-danger"
                htmlFor="customCheck-delete-completely"
              >
                {t('search_result.delete_completely')}
              </label>
            </div>
            <Button color={isDeleteCompletely ? 'danger' : 'light'} onClick={() => onDeleteInvoked()}>
              <i className="icon-trash"></i>
              {t('search_result.delete')}
            </Button>
          </span>
        </div>
      </ModalFooter>
    </Modal>
  );

};

export default PageDeleteOneModal;
