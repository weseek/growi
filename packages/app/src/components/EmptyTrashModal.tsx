import React, {
  useState, FC,
} from 'react';

import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { apiv3Delete } from '~/client/util/apiv3-client';
import { HasObjectId } from '~/interfaces/has-object-id';
import {
  IPageToDeleteWithMeta, IDataWithMeta, isIPageInfoForEntity, IPageInfoForEntity,
} from '~/interfaces/page';
import { useEmptyTrashModal } from '~/stores/modal';
import { useSWRxPageInfoForList } from '~/stores/page';

import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';

const EmptyTrashModal: FC = () => {
  const { t } = useTranslation();

  const { data: emptyTrashModalData, close: closeEmptyTrashModal } = useEmptyTrashModal();

  const isOpened = emptyTrashModalData?.isOpened ?? false;

  const notOperatablePages: IPageToDeleteWithMeta[] = (emptyTrashModalData?.pages ?? [])
    .filter(p => !isIPageInfoForEntity(p.meta));
  const notOperatablePageIds = notOperatablePages.map(p => p.data._id);

  const { injectTo } = useSWRxPageInfoForList(notOperatablePageIds);

  // inject IPageInfo to operate
  let injectedPages: IDataWithMeta<HasObjectId & { path: string }, IPageInfoForEntity>[] | null = null;
  if (emptyTrashModalData?.pages != null && notOperatablePageIds.length > 0) {
    injectedPages = injectTo(emptyTrashModalData?.pages);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errs, setErrs] = useState<Error[] | null>(null);

  async function emptyTrash() {
    if (emptyTrashModalData == null || emptyTrashModalData.pages == null) {
      return;
    }

    try {
      await apiv3Delete('/pages/empty-trash');
      const onEmptiedTrash = emptyTrashModalData.opts?.onEmptiedTrash;
      if (onEmptiedTrash != null) {
        onEmptiedTrash();
      }
      closeEmptyTrashModal();
    }
    catch (err) {
      setErrs([err]);
    }
  }

  async function emptyTrashButtonHandler() {
    await emptyTrash();
  }

  const renderPagePaths = () => {
    const pages = injectedPages != null && injectedPages.length > 0 ? injectedPages : emptyTrashModalData?.pages;

    if (pages != null) {
      return pages.map(page => (
        <p key={page.data._id} className="mb-1">
          <code>{ page.data.path }</code>
          { !page.meta?.isDeletable && <span className="ml-3 text-danger"><strong>(CAN NOT TO DELETE)</strong></span> }
        </p>
      ));
    }
    return <></>;
  };

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeEmptyTrashModal} data-testid="page-delete-modal" className="grw-create-page">
      <ModalHeader tag="h4" toggle={closeEmptyTrashModal} className="bg-danger text-light">
        <i className="icon-fw icon-fire"></i>
        {t('modal_empty.empty_the_trash')}
      </ModalHeader>
      <ModalBody>
        <div className="form-group grw-scrollable-modal-body pb-1">
          <label>{ t('modal_delete.deleting_page') }:</label><br />
          {/* Todo: change the way to show path on modal when too many pages are selected */}
          {renderPagePaths()}
        </div>
        {t('modal_empty.notice')}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} />
        <button
          type="button"
          className="btn btn-danger"
          onClick={emptyTrashButtonHandler}
        >
          <i className="mr-1 icon-fire" aria-hidden="true"></i>
          {t('modal_empty.empty_the_trash_button')}
        </button>
      </ModalFooter>
    </Modal>

  );
};

export default EmptyTrashModal;
