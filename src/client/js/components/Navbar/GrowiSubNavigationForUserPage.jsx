import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import RevisionPath from '../Page/RevisionPath';
import PageContainer from '../../services/PageContainer';
import BookmarkButton from '../BookmarkButton';
import UserPicture from '../User/UserPicture';

const GrowiSubNavigationForUserPage = (props) => {
  const pageUser = JSON.parse(document.querySelector('#grw-subnav-for-user-page').getAttribute('data-page-user'));
  const { appContainer, pageContainer } = props;
  const { pageId } = pageContainer.state;
  // const compactClassName = isCompactMode ? 'fixed-top grw-compact-subnavbar px-3' : null;

  return (
    <div>

      {/* Page Path */}
      <h4>
        <RevisionPath behaviorType={appContainer.config.behaviorType} pageId={pageId} pagePath={pageContainer.state.path} />
      </h4>

      <div className="d-flex">
        <div className="users-info d-flex align-items-center mr-auto">
          <UserPicture user={pageUser} />

          <div className="users-meta">
            <div className="d-flex align-items-center">
              <h1>
                {pageUser.name}
              </h1>
            </div>
            <div className="user-page-meta">
              <ul>
                <li className="user-page-username"><i className="icon-user mr-1"></i>{pageUser.username}</li>
                <li className="user-page-email">
                  <i className="icon-envelope mr-1"></i>
                  {pageUser.isEmailPublished ? pageUser.email : '*****'}
                </li>
                {pageUser.introduction && <li className="user-page-introduction"><p>{pageUser.introduction}</p></li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Header Button */}
        <BookmarkButton pageId={pageId} crowi={appContainer} />
      </div>


    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const GrowiSubNavigationForUserPageWrapper = (props) => {
  return createSubscribedElement(GrowiSubNavigationForUserPage, props, [AppContainer, PageContainer]);
};


GrowiSubNavigationForUserPage.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(GrowiSubNavigationForUserPageWrapper);
