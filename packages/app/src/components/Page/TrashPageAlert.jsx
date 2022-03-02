import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { UserPicture } from '@growi/ui';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

import { useCurrentUpdatedAt, useShareLinkId } from '~/stores/context';
import { usePageDeleteModal, usePutBackPageModal } from '~/stores/modal';
import { useSWRxPageInfo } from '~/stores/page';

import EmptyTrashModal from '../EmptyTrashModal';

const onDeletedHandler = (pathOrPathsToDelete, isRecursively, isCompletely) => {
  if (typeof pathOrPathsToDelete !== 'string') {
    return;
  }

  window.location.href = '/';
};

const TrashPageAlert = (props) => {
  const { t, pageContainer } = props;
  const {
    pageId, revisionId, path, isDeleted, lastUpdateUsername, deletedUserName, deletedAt,
  } = pageContainer.state;
  const { data: shareLinkId } = useShareLinkId();

  /*
  * TODO: Do not use useSWRxPageInfo on this component
  * Ideal: use useSWRxPageInfo on TrashPage after applying Next.js
  * Reference: https://github.com/weseek/growi/pull/5359#discussion_r808381329
  */
  const { data: pageInfo } = useSWRxPageInfo(pageId ?? null, shareLinkId);

  const { data: updatedAt } = useCurrentUpdatedAt();
  const [isEmptyTrashModalShown, setIsEmptyTrashModalShown] = useState(false);

  const { open: openDeleteModal } = usePageDeleteModal();
  const { open: openPutBackPageModal } = usePutBackPageModal();

  function openEmptyTrashModalHandler() {
    setIsEmptyTrashModalShown(true);
  }

  function closeEmptyTrashModalHandler() {
    setIsEmptyTrashModalShown(false);
  }

  function openPutbackPageModalHandler() {
    openPutBackPageModal({ pageId, path });
  }

  function openPageDeleteModalHandler() {
    const pageToDelete = {
      data: {
        _id: pageId,
        revision: revisionId,
        path,
      },
    };
    openDeleteModal(
      [pageToDelete],
      {
        isAbleToDeleteCompletely: pageInfo.isAbleToDeleteCompletely,
        onDeleted: onDeletedHandler,
      },
    );
  }

  function renderEmptyButton() {
    return (
      <button
        href="#"
        type="button"
        className="btn btn-danger rounded-pill btn-sm ml-auto"
        data-target="#emptyTrash"
        onClick={openEmptyTrashModalHandler}
      >
        <i className="icon-trash" aria-hidden="true"></i>{ t('modal_empty.empty_the_trash') }
      </button>
    );
  }

  function renderTrashPageManagementButtons() {
    return (
      <>
        <button
          type="button"
          className="btn btn-info rounded-pill btn-sm ml-auto mr-2"
          onClick={openPutbackPageModalHandler}
          data-toggle="modal"
        >
          <i className="icon-action-undo" aria-hidden="true"></i> { t('Put Back') }
        </button>
        <button
          type="button"
          className="btn btn-danger rounded-pill btn-sm"
          disabled={!(pageInfo?.isAbleToDeleteCompletely ?? false)}
          onClick={openPageDeleteModalHandler}
        >
          <i className="icon-fire" aria-hidden="true"></i> { t('Delete Completely') }
        </button>
      </>
    );
  }

  function renderModals() {
    return (
      <>
        <EmptyTrashModal
          isOpen={isEmptyTrashModalShown}
          onClose={closeEmptyTrashModalHandler}
        />
      </>
    );
  }

  return (
    <>
      <div className="alert alert-warning py-3 pl-4 d-flex flex-column flex-lg-row">
        <div className="flex-grow-1">
          This page is in the trash <i className="icon-trash" aria-hidden="true"></i>.
          {isDeleted && (
            <>
              <br />
              <UserPicture user={{ username: deletedUserName || lastUpdateUsername }} />
              <span className="ml-2">
                Deleted by {deletedUserName || lastUpdateUsername} at {deletedAt || updatedAt}
              </span>
            </>
          )}
        </div>
        <div className="pt-1 d-flex align-items-end align-items-lg-center">
          <span>{ pageContainer.isAbleToShowEmptyTrashButton && renderEmptyButton()}</span>
          { pageContainer.isAbleToShowTrashPageManagementButtons && renderTrashPageManagementButtons()}
        </div>
      </div>
      {renderModals()}
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const TrashPageAlertWrapper = withUnstatedContainers(TrashPageAlert, [AppContainer, PageContainer]);


TrashPageAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TrashPageAlertWrapper);
