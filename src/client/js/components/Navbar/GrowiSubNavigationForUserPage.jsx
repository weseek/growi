import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import LinkedPagePath from '@commons/models/linked-page-path';
import PagePathHierarchicalLink from '@commons/components/PagePathHierarchicalLink';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import RevisionPathControls from '../Page/RevisionPathControls';
import BookmarkButton from '../BookmarkButton';
import UserPicture from '../User/UserPicture';

// eslint-disable-next-line react/prop-types
const PagePathNav = ({ pageId, pagePath }) => {
  const linkedPagePath = new LinkedPagePath(pagePath);
  const latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />;

  return (
    <div className="grw-page-path-nav">
      <span className="d-flex align-items-center flex-wrap">
        <h4 className="grw-user-page-path">{latterLink}</h4>
        <RevisionPathControls
          pageId={pageId}
          pagePath={pagePath}
        />
      </span>
    </div>
  );
};

const GrowiSubNavigationForUserPage = (props) => {
  const pageUser = JSON.parse(document.querySelector('#grw-subnav-for-user-page').getAttribute('data-page-user'));
  const { appContainer, pageContainer } = props;
  const {
    pageId, path,
  } = pageContainer.state;

  const additionalClassNames = ['grw-subnavbar', 'grw-subnavbar-user-page'];
  const layoutType = appContainer.getConfig().layoutType;

  if (layoutType === 'growi') {
    additionalClassNames.push('py-3');
  }

  return (
    <div className={`px-3 py-3 ${additionalClassNames.join(' ')}`}>
      <PagePathNav pageId={pageId} pagePath={path} />

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
const GrowiSubNavigationForUserPageWrapper = withUnstatedContainers(GrowiSubNavigationForUserPage, [AppContainer, PageContainer]);


GrowiSubNavigationForUserPage.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(GrowiSubNavigationForUserPageWrapper);
