import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { useCurrentPagePath, useIsAbleToDeleteCompletely } from '~/stores/context';
import { useIsAbleToShowEmptyTrashButton, useIsAbleToShowTrashPageManagementButtons } from '~/stores/ui';

import { withUnstatedContainers } from '../UnstatedUtils';
import PageContainer from '../../services/PageContainer';
import UserPicture from '../User/UserPicture';
import PutbackPageModal from '../PutbackPageModal';
import EmptyTrashModal from '../EmptyTrashModal';
import PageDeleteModal from '~/components/PageManagement/PageDeleteModal';

const TrashPageAlert = (props) => {
  const { t, pageContainer } = props;
  const {
    isDeleted, lastUpdateUsername, updatedAt, deletedUserName, deletedAt,
  } = pageContainer.state;

  const { data: path } = useCurrentPagePath();
  const { data: isAbleToDeleteCompletely } = useIsAbleToDeleteCompletely();
  const { data: isAbleToShowEmptyTrashButton } = useIsAbleToShowEmptyTrashButton();
  const { data: isAbleToShowTrashPageManagementButtons } = useIsAbleToShowTrashPageManagementButtons();

  const [isEmptyTrashModalShown, setIsEmptyTrashModalShown] = useState(false);
  const [isPutbackPageModalShown, setIsPutbackPageModalShown] = useState(false);
  const [isPageDeleteModalShown, setIsPageDeleteModalShown] = useState(false);

  function openEmptyTrashModalHandler() {
    setIsEmptyTrashModalShown(true);
  }

  function closeEmptyTrashModalHandler() {
    setIsEmptyTrashModalShown(false);
  }

  function openPutbackPageModalHandler() {
    setIsPutbackPageModalShown(true);
  }

  function closePutbackPageModalHandler() {
    setIsPutbackPageModalShown(false);
  }

  function openPageDeleteModalHandler() {
    setIsPageDeleteModalShown(true);
  }

  function opclosePageDeleteModalHandler() {
    setIsPageDeleteModalShown(false);
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
          disabled={!isAbleToDeleteCompletely}
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
        <PutbackPageModal
          isOpen={isPutbackPageModalShown}
          onClose={closePutbackPageModalHandler}
          path={path}
        />
        <PageDeleteModal
          isOpen={isPageDeleteModalShown}
          onClose={opclosePageDeleteModalHandler}
          path={path}
          isDeleteCompletelyModal
          isAbleToDeleteCompletely={isAbleToDeleteCompletely}
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
          <span>{ isAbleToShowEmptyTrashButton && renderEmptyButton()}</span>
          { isAbleToShowTrashPageManagementButtons && renderTrashPageManagementButtons()}
        </div>
      </div>
      {renderModals()}
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const TrashPageAlertWrapper = withUnstatedContainers(TrashPageAlert, [PageContainer]);


TrashPageAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TrashPageAlertWrapper);
