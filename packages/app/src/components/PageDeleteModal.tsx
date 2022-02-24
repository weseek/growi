import React, { useState, FC, useMemo } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { apiPost } from '~/client/util/apiv1-client';
import { apiv3Post } from '~/client/util/apiv3-client';
import { usePageDeleteModal } from '~/stores/modal';

import {
  IDeleteSinglePageApiv1Result, IDeleteManyPageApiv3Result, isIPageInfoForOperation, IPageWithAnyMeta,
} from '~/interfaces/page';

import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';
import { isTrashPage } from '^/../core/src/utils/page-path-utils';
import { useSWRxPageInfoForList } from '~/stores/page';


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

const PageDeleteModal: FC = () => {
  const { t } = useTranslation();

  const { data: deleteModalData, close: closeDeleteModal } = usePageDeleteModal();

  const isOpened = deleteModalData?.isOpened ?? false;

  // const notOperatablePages: IPageWithAnyMeta[] = (deleteModalData?.pages ?? [])
  //   .filter(p => !isIPageInfoForOperation(p.pageMeta));
  // const notOperatablePageIds = notOperatablePages.map(p => p.pageData._id);

  // const { injectTo } = useSWRxPageInfoForList(notOperatablePageIds);
  // const injectedPages = injectTo(deleteModalData?.pages);

  const isAbleToDeleteCompletely = useMemo(() => {
    // if (deleteModalData != null && deleteModalData.pages != null && deleteModalData.pages.length > 0) {
    //   return deleteModalData.pages.every(page => page.pageMeta?.isAbleToDeleteCompletely);
    // }
    return true;
  }, [deleteModalData]);

  const forceDeleteCompletelyMode = useMemo(() => {
    if (deleteModalData != null && deleteModalData.pages != null && deleteModalData.pages.length > 0) {
      return deleteModalData.pages.every(page => isTrashPage(page.pageData?.path ?? ''));
    }
    return false;
  }, [deleteModalData]);

  const [isDeleteRecursively, setIsDeleteRecursively] = useState(true);
  const [isDeleteCompletely, setIsDeleteCompletely] = useState(forceDeleteCompletelyMode);
  const deleteMode = forceDeleteCompletelyMode || isDeleteCompletely ? 'completely' : 'temporary';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errs, setErrs] = useState<Error[] | null>(null);

  function changeIsDeleteRecursivelyHandler() {
    setIsDeleteRecursively(!isDeleteRecursively);
  }

  function changeIsDeleteCompletelyHandler() {
    if (forceDeleteCompletelyMode) {
      return;
    }
    setIsDeleteCompletely(!isDeleteCompletely);
  }

  async function deletePage() {
    if (deleteModalData == null || deleteModalData.pages == null) {
      return;
    }

    /*
     * When multiple pages
     */
    if (deleteModalData.pages.length > 1) {
      try {
        const isRecursively = isDeleteRecursively === true ? true : undefined;
        const isCompletely = isDeleteCompletely === true ? true : undefined;

        const pageIdToRevisionIdMap = {};
        deleteModalData.pages.forEach((p) => { pageIdToRevisionIdMap[p.pageData._id] = p.pageData.revision });

        const { data } = await apiv3Post<IDeleteManyPageApiv3Result>('/pages/delete', {
          pageIdToRevisionIdMap,
          isRecursively,
          isCompletely,
        });

        const onDeleted = deleteModalData.opts?.onDeleted;
        if (onDeleted != null) {
          onDeleted(data.paths, data.isRecursively, data.isCompletely);
        }
      }
      catch (err) {
        setErrs([err]);
      }
    }
    /*
     * When single page
     */
    else {
      try {
        const recursively = isDeleteRecursively === true ? true : undefined;
        const completely = forceDeleteCompletelyMode || isDeleteCompletely ? true : undefined;

        const page = deleteModalData.pages[0].pageData;

        const { path, isRecursively, isCompletely } = await apiPost('/pages.remove', {
          page_id: page._id,
          revision_id: page.revision,
          recursively,
          completely,
        }) as IDeleteSinglePageApiv1Result;

        const onDeleted = deleteModalData.opts?.onDeleted;
        if (onDeleted != null) {
          onDeleted(path, isRecursively, isCompletely);
        }
      }
      catch (err) {
        setErrs([err]);
      }
    }
  }

  async function deleteButtonHandler() {
    await closeDeleteModal();
    await deletePage();
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
          <p className="form-text text-muted mt-0"> { t('modal_delete.recursively') }</p>
        </label>
      </div>
    );
  }

  function renderDeleteCompletelyForm() {
    return (
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
    if (deleteModalData != null && deleteModalData.pages != null) {
      return deleteModalData.pages.map(page => <div key={page.pageData._id}><code>{ page.pageData.path }</code></div>);
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
        { !forceDeleteCompletelyMode && renderDeleteCompletelyForm() }
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
