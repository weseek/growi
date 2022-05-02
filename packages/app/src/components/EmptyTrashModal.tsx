import React, {
  useState, FC, useMemo, useCallback,
} from 'react';

import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { apiPost } from '~/client/util/apiv1-client';
import { apiv3Delete, apiv3Post } from '~/client/util/apiv3-client';
import { HasObjectId } from '~/interfaces/has-object-id';
import {
  IDeleteSinglePageApiv1Result, IDeleteManyPageApiv3Result, IPageToDeleteWithMeta, IDataWithMeta, isIPageInfoForEntity, IPageInfoForEntity,
} from '~/interfaces/page';
import { usePageDeleteModal } from '~/stores/modal';
import { useSWRxPageInfoForList } from '~/stores/page';
import loggerFactory from '~/utils/logger';


import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';

import { isTrashPage } from '^/../core/src/utils/page-path-utils';


const logger = loggerFactory('growi:cli:PageDeleteModal');


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

const EmptyTrashModal: FC = () => {
  const { t } = useTranslation();

  const { data: emptyTrashModalData, close: closeEmptyTrashModal } = useEmptyTrashModal();

  const isOpened = emptyTrashModalData?.isOpened ?? false;

  const notOperatablePages: IPageToDeleteWithMeta[] = (deleteModalData?.pages ?? [])
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
      if (onDeleted != null) {
        onDeleted('', null, null);
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
    const pages = injectedPages != null && injectedPages.length > 0 ? injectedPages : deleteModalData?.pages;

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
      <ModalHeader tag="h4" toggle={closeEmptyTrashModal} className={`bg-${deleteIconAndKey[deleteMode].color} text-light`}>
        <i className={`icon-fw icon-${deleteIconAndKey[deleteMode].icon}`}></i>
        {t('ゴミ箱を空にする文言')}
      </ModalHeader>
      <ModalBody>
        <div className="form-group grw-scrollable-modal-body pb-1">
          <label>{ t('modal_delete.deleting_page') }:</label><br />
          {/* Todo: change the way to show path on modal when too many pages are selected */}
          {renderPagePaths()}
        </div>
        {t('ゴミ箱を空にする文言')}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} />
        <button
          type="button"
          className={`btn btn-${deleteIconAndKey[deleteMode].color}`}
          onClick={emptyTrashButtonHandler}
        >
          <i className={`mr-1 icon-${deleteIconAndKey[deleteMode].icon}`} aria-hidden="true"></i>
          {t('ゴミ箱を空にする文言')}
        </button>
      </ModalFooter>
    </Modal>

  );
};

export default EmptyTrashModal;


// import React, { useState } from 'react';
// import PropTypes from 'prop-types';

// import {
//   Modal, ModalHeader, ModalBody, ModalFooter,
// } from 'reactstrap';

// import { withTranslation } from 'react-i18next';
// import { withUnstatedContainers } from './UnstatedUtils';

// import SocketIoContainer from '~/client/services/SocketIoContainer';
// import AppContainer from '~/client/services/AppContainer';
// import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';


// const EmptyTrashModal = (props) => {
//   const {
//     t, isOpen, onClose, appContainer, socketIoContainer,
//   } = props;

//   const [errs, setErrs] = useState(null);

//   async function emptyTrash() {
//     setErrs(null);

//     try {
//       await appContainer.apiv3Delete('/pages/empty-trash');
//       window.location.reload();
//     }
//     catch (err) {
//       setErrs(err);
//     }
//   }

//   function emptyButtonHandler() {
//     emptyTrash();
//   }

//   return (
//     <Modal isOpen={isOpen} toggle={onClose} className="grw-create-page">
//       <ModalHeader tag="h4" toggle={onClose} className="bg-danger text-light">
//         { t('modal_empty.empty_the_trash')}
//       </ModalHeader>
//       <ModalBody>
//         { t('modal_empty.notice')}
//       </ModalBody>
//       <ModalFooter>
//         <ApiErrorMessageList errs={errs} />
//         <button type="button" className="btn btn-danger" onClick={emptyButtonHandler}>
//           <i className="icon-trash mr-2" aria-hidden="true"></i> Empty
//         </button>
//       </ModalFooter>
//     </Modal>
//   );
// };

// /**
//  * Wrapper component for using unstated
//  */
// const EmptyTrashModalWrapper = withUnstatedContainers(EmptyTrashModal, [AppContainer, SocketIoContainer]);


// EmptyTrashModal.propTypes = {
//   t: PropTypes.func.isRequired, //  i18next
//   appContainer: PropTypes.instanceOf(AppContainer).isRequired,
//   socketIoContainer: PropTypes.instanceOf(SocketIoContainer),

//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
// };

// export default withTranslation()(EmptyTrashModalWrapper);
