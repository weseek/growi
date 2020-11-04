import React from 'react';
import PropTypes from 'prop-types';

import AuthorInfo from './NavBar/AuthorInfo';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import { withUnstatedContainers } from './UnstatedUtils';

const PageContentFooter = (props) => {
  const { pageContainer } = props;
  const {
    createdAt, creator, updatedAt, revisionAuthor,
  } = pageContainer.state;

  return (
    <div className="page-attachments-row mt-5 py-4 d-edit-none d-print-none">
      <div className="container-lg">
        <p className="page-meta">
          <AuthorInfo user={creator} date={createdAt} mode="create" locate="footer" />
          <AuthorInfo user={revisionAuthor} date={updatedAt} mode="update" locate="footer" />
        </p>
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
