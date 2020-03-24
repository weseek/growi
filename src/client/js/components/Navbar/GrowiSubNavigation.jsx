import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { isTrashPage, userPageRoot } from '../../../../lib/util/path-utils';
import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import RevisionPath from '../Page/RevisionPath';
import PageContainer from '../../services/PageContainer';
import TagLabels from '../Page/TagLabels';
import LikeButton from '../LikeButton';
import BookmarkButton from '../BookmarkButton';
import UserPicture from '../User/UserPicture';

const GrowiSubNavigation = (props) => {
  const { appContainer, pageContainer } = props;
  const path = pageContainer.path || '';
  const {
    createdAt, creator, updatedAt, revisionAuthor,
  } = pageContainer.state;

  return (
    <div className="d-flex align-items-center">

      {/* Page Path */}
      <div className="title-container mr-auto">
        <h1>
          <RevisionPath behaviorType={appContainer.config.behaviorType} pageId={pageContainer.state.pageId} pagePath={pageContainer.state.path} />
        </h1>
        {/* TODO hide this component at forbidden page */}
        {!isTrashPage(path) && <TagLabels />}
      </div>

      {/* Header Button */}
      <div className="ml-1">
        <LikeButton pageId={pageContainer.state.pageId} isLiked={pageContainer.state.isLiked} />
      </div>
      <div>
        <BookmarkButton pageId={pageContainer.state.pageId} crowi={appContainer} />
      </div>
      <ul className="authors hidden-sm hidden-xs text-nowrap">
        {creator != null
        && (
        <li>
          <div className="d-flex align-items-center">
            <div className="mr-2" href={userPageRoot(creator)} data-toggle="tooltip" data-placement="bottom" title={creator.name}>
              <UserPicture user={creator} size="sm" />
            </div>
            <div>
              <div>Created by <a href={userPageRoot(creator)}>{creator.name}</a></div>
              <div className="text-muted">{createdAt}</div>
            </div>
          </div>
        </li>
        )}
        {revisionAuthor != null
        && (
        <li className="mt-1">
          <div className="d-flex align-items-center">
            <div className="mr-2" href={userPageRoot(revisionAuthor)} data-toggle="tooltip" data-placement="bottom" title={revisionAuthor.name}>
              <UserPicture user={revisionAuthor} size="sm" />
            </div>
            <div>
              <div>Updated by  <a href={userPageRoot(revisionAuthor)}>{revisionAuthor.name }</a></div>
              <div className="text-muted">{updatedAt}</div>
            </div>
          </div>
        </li>
        )}
      </ul>
    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const GrowiSubNavigationWrapper = (props) => {
  return createSubscribedElement(GrowiSubNavigation, props, [AppContainer, PageContainer]);
};


GrowiSubNavigation.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(GrowiSubNavigationWrapper);
