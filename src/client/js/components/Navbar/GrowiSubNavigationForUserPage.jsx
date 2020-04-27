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
  const { pageId, isHeaderSticky, isSubnavCompact } = pageContainer.state;

  const additionalClassNames = ['grw-subnavbar', 'grw-subnavbar-user-page'];
  if (isHeaderSticky) {
    additionalClassNames.push('grw-subnavbar-sticky');
  }
  if (isSubnavCompact) {
    additionalClassNames.push('py-2 grw-subnavbar-compact');
  }
  else {
    additionalClassNames.push('py-3');
  }

  return (
    <div className={`px-3 ${additionalClassNames.join(' ')}`}>
      <h4 className="grw-user-page-path">
        <RevisionPath behaviorType={appContainer.config.behaviorType} pageId={pageId} pagePath={pageContainer.state.path} />
      </h4>

      <div className="d-flex align-items-center justify-content-between">

        <div className="users-info d-flex align-items-center d-edit-none">
          <UserPicture user={pageUser} />

          <div className="users-meta">
            <h1>
              {pageUser.name}
            </h1>
            <ul className="user-page-meta mt-1 mb-0">
              <li className="user-page-username"><i className="icon-user mr-1"></i>{pageUser.username}</li>
              <li className="user-page-email">
                <i className="icon-envelope mr-1"></i>
                {pageUser.isEmailPublished ? pageUser.email : '*****'}
              </li>
              {pageUser.introduction && <li className="user-page-introduction"><p>{pageUser.introduction}</p></li>}
            </ul>
          </div>
        </div>

        <BookmarkButton pageId={pageId} crowi={appContainer} size="lg" />
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
