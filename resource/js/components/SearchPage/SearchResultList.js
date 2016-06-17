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
      const keywordExp = new RegExp('(' + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ')', 'g');
      returnBody = returnBody.replace(keyword, '<span style="highlighted">$&</span>');
    });

    //console.log(this.props.searchingKeyword, body);
    return returnBody;
  }

  render() {
    const resultList = this.props.pages.map((page) => {
      const pageBody = this.getHighlightBody(page.revision.body);
      //console.log('resultList.page.path', page.path);
      //console.log('resultList.pageBody', pageBody);
      return (
        <div id={page._id} key={page._id}>
          <h2>{page.path}</h2>
          <div>
            <PageBody page={page} pageBody={pageBody} />
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

