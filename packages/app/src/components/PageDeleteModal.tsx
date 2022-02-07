import React, { useState, FC } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import nodePath from 'path';

import { apiPost } from '~/client/util/apiv1-client';
import { usePageDeleteModalStatus, usePageDeleteModalOpened } from '~/stores/ui';

import { IPageApiv1Result } from '~/interfaces/page';

import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';


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
  isDeleteCompletelyModal: boolean,
  isAbleToDeleteCompletely: boolean,
  onClose?: () => void,
}

const PageDeleteModal: FC<Props> = (props: Props) => {
  const { t } = useTranslation('');
  const {
    isDeleteCompletelyModal, isAbleToDeleteCompletely,
  } = props;


  const { data: pagesDataToDelete, close: closeDeleteModal } = usePageDeleteModalStatus();
  const { data: isOpened } = usePageDeleteModalOpened();

  const [isDeleteRecursively, setIsDeleteRecursively] = useState(true);
  const [isDeleteCompletely, setIsDeleteCompletely] = useState(isDeleteCompletelyModal && isAbleToDeleteCompletely);
  const deleteMode = isDeleteCompletely ? 'completely' : 'temporary';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errs, setErrs] = useState(null);

  function changeIsDeleteRecursivelyHandler() {
    setIsDeleteRecursively(!isDeleteRecursively);
  }

  function changeIsDeleteCompletelyHandler() {
    if (!isAbleToDeleteCompletely) {
      return;
    }
    setIsDeleteCompletely(!isDeleteCompletely);
  }

  async function deletePage() {
    // toastr.warning(t('search_result.currently_not_implemented'));
    // Todo implement page delete function at https://redmine.weseek.co.jp/issues/82222
    // setErrs(null);

    if (pagesDataToDelete?.pages != null && (pagesDataToDelete.pages.length > 0)) {
      try {
        const recursively = isDeleteRecursively === true ? true : undefined;
        const completely = isDeleteCompletely === true ? true : undefined;

        // TODO: Create an endpoint (pages.removeMany)
        const result = await apiPost('/pages.removeMany', {
          pages: pagesDataToDelete.pages,
          recursively,
          completely,
        }) as IPageApiv1Result;

        const trashPagePath = result.page.path;

        window.location.href = encodeURI(trashPagePath);

      }
      catch (err) {
        setErrs(err);
      }
    }
  }

  async function deleteButtonHandler() {
    deletePage();
  }

  function renderDeleteRecursivelyForm() {
    return (
      <div className="custom-control custom-checkbox custom-checkbox-warning">
        <input
          className="custom-control-input"
          id="deleteRecursively"
          type="checkbox"
          checked={isDeleteRecursively}
          onChange={changeIsDeleteRecursivelyHandler}
          // disabled // Todo: enable this at https://redmine.weseek.co.jp/issues/82222
        />
        <label className="custom-control-label" htmlFor="deleteRecursively">
          { t('modal_delete.delete_recursively') }
        </label>
      </div>
    );
  }

  // DeleteCompletely is currently disabled
  // TODO1 : Retrive isAbleToDeleteCompleltly state everywhere in the system via swr.
  // Story: https://redmine.weseek.co.jp/issues/82222

  // TODO2 : use toaster
  // TASK : https://redmine.weseek.co.jp/issues/82299
  function renderDeleteCompletelyForm() {
    return (
      <div className="custom-control custom-checkbox custom-checkbox-danger">
        <input
          className="custom-control-input"
          name="completely"
          id="deleteCompletely"
          type="checkbox"
          // disabled={!isAbleToDeleteCompletely}
          // disabled // Todo: will be implemented at https://redmine.weseek.co.jp/issues/82222
          checked={isDeleteCompletely}
          onChange={changeIsDeleteCompletelyHandler}
        />
        {/* ↓↓ undo this comment out at https://redmine.weseek.co.jp/issues/82222 ↓↓ */}
        {/* <label className="custom-control-label text-danger" htmlFor="deleteCompletely"> */}
        <label className="custom-control-label" htmlFor="deleteCompletely">
          { t('modal_delete.delete_completely')}
          <p className="form-text text-muted mt-0"> { t('modal_delete.completely') }</p>
        </label>
        {!isAbleToDeleteCompletely
        && (
          <p className="alert alert-warning p-2 my-0">
            <i className="icon-ban icon-fw"></i>{ t('modal_delete.delete_completely_restriction') }
          </p>
        )}
      </div>
    );
  }

  const renderPagePathsToDelete = () => {
    if (pagesDataToDelete != null && pagesDataToDelete.pages != null) {
      return pagesDataToDelete.pages.map(page => <div key={page.pageId}><code>{ page.path }</code></div>);
    }
    return <></>;
  };

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeDeleteModal} className="grw-create-page">
      <ModalHeader tag="h4" toggle={closeDeleteModal} className={`bg-${deleteIconAndKey[deleteMode].color} text-light`}>
        <i className={`icon-fw icon-${deleteIconAndKey[deleteMode].icon}`}></i>
        { t(`modal_delete.delete_${deleteIconAndKey[deleteMode].translationKey}`) }
      </ModalHeader>
      <ModalBody>
        <div className="form-group grw-scrollable-modal-body pb-1">
          <label>{ t('modal_delete.deleting_page') }:</label><br />
          {/* Todo: change the way to show path on modal when too many pages are selected */}
          {/* https://redmine.weseek.co.jp/issues/82787 */}
          {renderPagePathsToDelete()}
        </div>
        {renderDeleteRecursivelyForm()}
        {!isDeleteCompletelyModal && renderDeleteCompletelyForm()}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} />
        <button type="button" className={`btn btn-${deleteIconAndKey[deleteMode].color}`} onClick={deleteButtonHandler}>
          <i className={`icon-${deleteIconAndKey[deleteMode].icon}`} aria-hidden="true"></i>
          { t(`modal_delete.delete_${deleteIconAndKey[deleteMode].translationKey}`) }
        </button>
      </ModalFooter>
    </Modal>

  );
};

export default PageDeleteModal;
