import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { isTopPage, isUserPage } from '@commons/util/path-utils';
import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import UserPicture from '../User/UserPicture';


const TrashPageAlert = (props) => {
  const { t, appContainer, pageContainer } = props;
  const {
    path, isDeleted, revisionAuthor, updatedAt, childrenPages,
  } = pageContainer.state;
  console.log(pageContainer.state);
  const { currentUser } = appContainer;

  const isTopPagePath = isTopPage(path);
  const isUserPagePath = isUserPage(path);
  // const now = format(updatedAt, 'Y-m-d H:i:s');

  return (
    <div className="alert alert-warning py-3 px-4 d-flex align-items-center justify-content-between">
      <div>
      This page is in the trash <i className="icon-trash" aria-hidden="true"></i>.
        {isDeleted && <span><br /><UserPicture user={revisionAuthor} /> Deleted by {revisionAuthor.name} at {updatedAt}</span>}
      </div>
      {currentUser.admin && path === '/trash' && childrenPages.length > 0 && (
      <div>
        <button href="#" type="button" className="btn btn-danger rounded-pill btn-sm" data-target="#emptyTrash" data-toggle="modal">
          <i className="icon-trash" aria-hidden="true"></i>{ t('modal_empty.empty_the_trash') }
        </button>
      </div>
      )}
      {/*
    {% if page.isDeleted() and user %}
    <div>
      <button href="#" class="btn btn-outline-secondary rounded-pill btn-sm mr-2" data-target="#putBackPage" data-toggle="modal"><i class="icon-action-undo" aria-hidden="true"></i> {{ t('Put Back') }}</button>
      <button href="#" class="btn btn-danger rounded-pill btn-sm mr-2" {% if !user.canDeleteCompletely(page.creator._id) %} disabled="disabled" {% endif %} data-target="#deletePage" data-toggle="modal"><i class="icon-fire" aria-hidden="true"></i> {{ t('Delete Completely') }}</button>
    </div>
    {% endif %} */}
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
