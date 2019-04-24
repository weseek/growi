import React from 'react';
import PropTypes from 'prop-types';

import GrowiRenderer from '../../util/GrowiRenderer';

import RevisionLoader from '../Page/RevisionLoader';

export default class SearchResultList extends React.Component {

  constructor(props) {
    super(props);

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiRenderer, { mode: 'searchresult' });
  }

  render() {
    const resultList = this.props.pages.map((page) => {
      return (
        <div id={page._id} key={page._id} className="search-result-page">
          <h2 className="inline"><a href={page.path}>{page.path}</a></h2>
          { page.tags.length > 0 && (
            <span><i className="fa fa-tags"></i> {page.tags.join(', ')}</span>
          )}
          <RevisionLoader
            crowi={this.props.crowi}
            crowiRenderer={this.growiRenderer}
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

SearchResultList.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiRenderer: PropTypes.object.isRequired,
  pages: PropTypes.array.isRequired,
  searchingKeyword: PropTypes.string.isRequired,
};

SearchResultList.defaultProps = {
};
