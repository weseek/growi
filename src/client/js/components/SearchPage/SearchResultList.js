import React from 'react';
import PropTypes from 'prop-types';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../services/AppContainer';
import { createSubscribedElement } from '../UnstatedUtils';

class SearchResultList extends React.Component {

  constructor(props) {
    super(props);

    this.growiRenderer = this.props.appContainer.getRenderer('searchresult');
  }

  render() {
    const resultList = this.props.pages.map((page) => {
      return (
        <div id={page._id} key={page._id} className="search-result-page">
          <h2 className="inline"><a href={page.path}>{page.path}</a></h2>
          { page.tags.length > 0 && (
            <span><i className="tag-icon icon-tag"></i> {page.tags.join(', ')}</span>
          )}
          <RevisionLoader
            growiRenderer={this.growiRenderer}
            pageId={page._id}
            pagePath={page.path}
            revisionId={page.revision}
            highlightKeywords={this.props.searchingKeyword}
          />
        </div>
      );
    });

    return (
      <div>
        {resultList}
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SearchResultListWrapper = (props) => {
  return createSubscribedElement(SearchResultList, props, [AppContainer]);
};

SearchResultList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pages: PropTypes.array.isRequired,
  searchingKeyword: PropTypes.string.isRequired,
};

SearchResultList.defaultProps = {
};

export default SearchResultListWrapper;
