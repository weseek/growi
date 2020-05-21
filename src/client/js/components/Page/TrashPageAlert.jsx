import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import UserPicture from '../User/UserPicture';


const TrashPageAlert = (props) => {
  const { t, appContainer, pageContainer } = props;
  const {
    path, isDeleted, revisionAuthor, updatedAt, hasChildren, isAbleToDeleteCompletely,
  } = pageContainer.state;
  const { currentUser } = appContainer;

  function renderEmptyButton() {
    return (
      <button href="#" type="button" className="btn btn-danger rounded-pill btn-sm ml-auto" data-target="#emptyTrash" data-toggle="modal">
        <i className="icon-trash" aria-hidden="true"></i>{ t('modal_empty.empty_the_trash') }
      </button>
    );
  }

  function renderTrashPageManagementButtons() {
    return (
      <>
        <button
          type="button"
          className="btn btn-outline-secondary rounded-pill btn-sm ml-auto mr-2"
          data-target="#putBackPage"
          data-toggle="modal"
        >
          <i className="icon-action-undo" aria-hidden="true"></i> { t('Put Back') }
        </button>
        <button
          type="button"
          className="btn btn-danger rounded-pill btn-sm mr-2"
          disabled={!isAbleToDeleteCompletely}
          data-target="#deletePage"
          data-toggle="modal"
        >
          <i className="icon-fire" aria-hidden="true"></i> { t('Delete Completely') }
        </button>
      </>
    );
  }

  return (
    <div className="alert alert-warning py-3 px-4 d-flex align-items-center">
      <div>
      This page is in the trash <i className="icon-trash" aria-hidden="true"></i>.
        {isDeleted && <span><br /><UserPicture user={revisionAuthor} /> Deleted by {revisionAuthor.name} at {updatedAt}</span>}
      </div>
      {(currentUser.admin && path === '/trash' && hasChildren) && renderEmptyButton()}
      {(isDeleted && currentUser != null) && renderTrashPageManagementButtons()}
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const TrashPageAlertWrapper = (props) => {
  return createSubscribedElement(TrashPageAlert, props, [AppContainer, PageContainer]);
};


TrashPageAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TrashPageAlertWrapper);
