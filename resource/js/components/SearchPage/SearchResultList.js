import React from 'react';

import PageBody from '../Page/PageBody.js';

export default class SearchResultList extends React.Component {

  constructor(props) {
    super(props);

    this.getHighlightBody = this.getHighlightBody.bind(this);
  }

  getHighlightBody(body) {
    let returnBody = body;

    this.props.searchingKeyword.split(' ').forEach((keyword) => {
      if (keyword === '') {
        return;
      }
      const k = keyword
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .replace(/(^"|"$)/g, ''); // for phrase (quoted) keyword
      const keywordExp = new RegExp(`(${k}(?!(.*?\]|.*?\\)|.*?"|.*?>)))`, 'ig');
      returnBody = returnBody.replace(keywordExp, '<em class="highlighted">$&</em>');
    });

    //console.log(this.props.searchingKeyword, body);
    return returnBody;
  }

  render() {
    const resultList = this.props.pages.map((page) => {
      const pageBody = this.getHighlightBody(page.revision.body);
      return (
        <div id={page._id} key={page._id} className="search-result-page">
          <h2><a href={page.path}>{page.path}</a></h2>
          <div className="wiki">
            <PageBody className="hige" page={page} pageBody={pageBody} />
          </div>
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
  pages: React.PropTypes.array.isRequired,
  searchingKeyword: React.PropTypes.string.isRequired,
};

SearchResultList.defaultProps = {
  pages: [],
  searchingKeyword: '',
};
