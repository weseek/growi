import React from 'react';
import PropTypes from 'prop-types';

import GrowiRenderer from '../../util/GrowiRenderer';

import Page from '../Page.js';

export default class SearchResultList extends React.Component {

  constructor(props) {
    super(props);

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiRenderer, {mode: 'searchresult'});
  }

  render() {
    const resultList = this.props.pages.map((page) => {
      const pageBody = page.revision.body;
      return (
        <div id={page._id} key={page._id} className="search-result-page">
          <h2><a href={page.path}>{page.path}</a></h2>
          <Page
            crowi={this.props.crowi}
            crowiRenderer={this.growiRenderer}
            markdown={pageBody}
            pagePath={page.path}
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
  pages: [],
  searchingKeyword: '',
};
