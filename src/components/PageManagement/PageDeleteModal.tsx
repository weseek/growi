import React, { useState, FC } from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from '~/i18n';

import { Page as IPage } from '~/interfaces/page';
import { toastSuccess } from '~/client/js/util/apiNotification';
import { apiv3Put } from '~/utils/apiv3-client';

import { useCurrentPageSWR } from '~/stores/page';

import { ApiErrorMessageList } from '~/components/PageManagement/ApiErrorMessageList';

const deleteIconAndKey = {
  completely: {
    color: 'danger',
    icon: 'fire',
    translationKey: 'completely',
  },
  temporary: {
    color: 'primary',
    icon: 'trash',
    translationKey: 'page',
  },
};


type Props = {
  isOpen: boolean;
  currentPage: IPage;
  isAbleToDeleteCompletely?: boolean;
  isDeleteCompletelyModal?: boolean;
  onClose:() => void;
}

const PageDeleteModal:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const { mutate: mutateCurrentPage } = useCurrentPageSWR();

  const { isAbleToDeleteCompletely = false, currentPage, isDeleteCompletelyModal } = props;
  const [errs, setErrs] = useState([]);
  const [isDeleteRecursively, setIsDeleteRecursively] = useState(true);
  const [isDeleteCompletely, setIsDeleteCompletely] = useState(isDeleteCompletelyModal && isAbleToDeleteCompletely);

  const deleteMode = isDeleteCompletely ? 'completely' : 'temporary';

  const changeIsDeleteRecursivelyHandler = () => {
    setIsDeleteRecursively(!isDeleteRecursively);
  };

  const deletePage = async() => {
    setErrs([]);

    try {
      const response = await apiv3Put('/pages/remove', {
        isRecursively: isDeleteRecursively,
        isCompletely: isDeleteCompletely,
        pageId: currentPage._id,
        revisionId: currentPage.revision._id,
        // TODO GW-5134 use SocketIoContainer after implement
        // socketClientId: SocketIoContainer.getSocketClientId(),
      });
      const { page } = response.data;
      window.location.href = encodeURI(page.path);
    }
    catch (err) {
      setErrs(err);
    }
  };

  const loadLatestRevision = () => {
    props.onClose();
    mutateCurrentPage();
    toastSuccess(t('retrieve_again'));
  };

  function changeIsDeleteCompletelyHandler() {
    if (!isAbleToDeleteCompletely) {
      return;
    }
    setIsDeleteCompletely(!isDeleteCompletely);
  }

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} autoFocus={false}>
      <ModalHeader tag="h4" toggle={props.onClose} className={`bg-${deleteIconAndKey[deleteMode].color} text-light`}>
        <i className={`icon-fw icon-${deleteIconAndKey[deleteMode].icon}`}></i>
        { t(`modal_delete.delete_${deleteIconAndKey[deleteMode].translationKey}`) }
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label>{ t('modal_delete.deleting_page') }:</label><br />
          <code>{ currentPage.path }</code>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            id="deleteRecursively"
            type="checkbox"
            checked={isDeleteRecursively}
            onChange={changeIsDeleteRecursivelyHandler}
          />
          <label className="custom-control-label" htmlFor="deleteRecursively">
            { t('modal_delete.delete_recursively') }
            <p className="form-text text-muted mt-0"><code>{currentPage.path}</code> { t('modal_delete.recursively') }</p>
          </label>
        </div>
        {!isDeleteCompletelyModal && (
          <div className="custom-control custom-checkbox custom-checkbox-danger">
            <input
              className="custom-control-input"
              name="completely"
              id="deleteCompletely"
              type="checkbox"
              disabled={!isAbleToDeleteCompletely}
              checked={isDeleteCompletely}
              onChange={changeIsDeleteCompletelyHandler}
            />
            <label className="custom-control-label text-danger" htmlFor="deleteCompletely">
              { t('modal_delete.delete_completely') }
              <p className="form-text text-muted mt-0"> { t('modal_delete.completely') }</p>
            </label>
            {!isAbleToDeleteCompletely && (
            <p className="alert alert-warning p-2 my-0">
              <i className="icon-ban icon-fw"></i>{ t('modal_delete.delete_completely_restriction') }
            </p>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={currentPage.path} onLoadLatestRevision={loadLatestRevision} />
        <button type="button" className={`btn btn-${deleteIconAndKey[deleteMode].color}`} onClick={deletePage}>
          <i className={`icon-${deleteIconAndKey[deleteMode].icon}`} aria-hidden="true"></i>
          { t(`modal_delete.delete_${deleteIconAndKey[deleteMode].translationKey}`) }
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PageDeleteModal;
