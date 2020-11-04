import React from 'react';
import PropTypes from 'prop-types';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import { withUnstatedContainers } from './UnstatedUtils';

const PageContentFooter = (props) => {
  return (
    <div className="page-attachments-row mt-5 py-4 d-edit-none d-print-none">
      <div className="container-lg">
        <p className="page-meta">
          <p>Last revision posted at </p>
          <p>Created at</p>
          {/* <p>Last revision posted at {{ page.revision.createdAt|datetz('Y-m-d H:i:s') }} by <a href="/user/{{ page.revision.author.username }}"><
            img src="{{ page.revision.author.imageUrlCached|default('/images/icons/user.svg') }}" class="picture picture-sm rounded-circle">
            {{ page.revision.author.name }}</a></p>
          <p>Created at {{ page.createdAt|datetz('Y-m-d H:i:s') }} by <a href="/user/{{ page.creator.username }}">
            <img src="{{ page.creator.imageUrlCached|default('/images/icons/user.svg') }}" class="picture picture-sm rounded-circle">
            {{ page.creator.name }}</a></p> */}
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
