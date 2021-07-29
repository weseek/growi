import React from 'react';
import PropTypes from 'prop-types';

import AuthorInfo from './Navbar/AuthorInfo';

import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';
import { withUnstatedContainers } from './UnstatedUtils';

const PageContentFooter = (props) => {
  const { pageContainer } = props;
  const {
    createdAt, creator, updatedAt, revisionAuthor,
  } = pageContainer.state;

  return (
    <div className="page-content-footer py-4 d-edit-none d-print-none">
      <div className="grw-container-convertible">
        <div className="page-meta">
          <AuthorInfo user={creator} date={createdAt} mode="create" locate="footer" />
          <AuthorInfo user={revisionAuthor} date={updatedAt} mode="update" locate="footer" />
        </div>
      </div>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const PageContentFooterWrapper = withUnstatedContainers(PageContentFooter, [AppContainer, PageContainer]);


PageContentFooter.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default PageContentFooterWrapper;
