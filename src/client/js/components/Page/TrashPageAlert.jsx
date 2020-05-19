import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { isTopPage, isUserPage } from '@commons/util/path-utils';
import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';


const TrashPageAlert = (props) => {
  const { t, appContainer, pageContainer } = props;
  const { path } = pageContainer.state;
  const { currentUser } = appContainer;
  const isTopPagePath = isTopPage(path);
  const isUserPagePath = isUserPage(path);

  return (
    <div className="alert alert-warning py-3 px-4 d-flex align-items-center justify-content-between">
      hoge
      {/* <div>
      This page is in the trash <i class="icon-trash" aria-hidden="true"></i>.
      {% if page.isDeleted() %}
      <br>Deleted by <img src="{{ page.lastUpdateUser|picture }}" class="picture picture-sm rounded-circle"> {{ page.lastUpdateUser.name }} at {{ page.updatedAt|datetz('Y-m-d H:i:s') }}
      {% endif %}
    </div>
    {% if user and user.admin and req.path == '/trash' and pages.length > 0 %}
    <div>
      <button href="#" class="btn btn-danger rounded-pill btn-sm" data-target="#emptyTrash" data-toggle="modal"><i class="icon-trash" aria-hidden="true"></i>{{ t('modal_empty.empty_the_trash') }}</button>
    </div>
    {% endif %}
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
