import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '~/client/services/AppContainer';

// TODO : move to serachPage dir
const SearchResultContent = (props) => {
  const renderPage = (page) => {
    const growiRenderer = props.appContainer.getRenderer('searchresult');
    const showTags = page != null && page.tags.length > 0;
    return (
      // Add prefix 'id_' in id attr, because scrollspy of bootstrap doesn't work when the first letter of id of target component is numeral.
      <div id={`id_${page._id}`} key={page._id} className="search-result-page mb-5">
        <h2>
          <a href={page.path} className="text-break">
            {page.path}
          </a>
          {showTags && (
            <div className="mt-1 small">
              <i className="tag-icon icon-tag"></i> {page.tags.join(', ')}
            </div>
          )}
        </h2>
        <RevisionLoader
          growiRenderer={growiRenderer}
          pageId={page._id}
          pagePath={page.path}
          revisionId={page.revision}
          highlightKeywords={props.searchingKeyword}
        />
      </div>
    );
  };
  const content = renderPage(props.selectedPage);
  return (
    { content }
  );
};

SearchResultContent.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  searchingKeyword: PropTypes.string.isRequired,
  selectedPage: PropTypes.object.isRequired,
};

export default SearchResultContent;
