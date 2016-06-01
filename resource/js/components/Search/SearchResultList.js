import React from 'react';

import PageBody from '../Page/PageBody.js';

export default class SearchResultList extends React.Component {

  constructor(props) {
    super(props);

    this.getHighlightBody = this.getHighlightBody.bind(this);
  }

  getHighlightBody(body) {
    console.log('getHighlightBody', this.props.searchingKeyword);
    console.log('getHighlightBody', this.props.searchingKeyword.split(' '));
    this.props.searchingKeyword.split(' ').forEach((keyword) => {
      console.log(keyword);
      const keywordExp = new RegExp('(' + keyword + ')', 'g');
      console.log(keywordExp);
      console.log(body.repalce(keywordExp, 'hoge hoge'));
      //body = body.repalce(keywordExp, '<span style="highlighted">$1</span>');
    });

    //console.log(this.props.searchingKeyword, body);
    return body;
  }

  render() {
    const resultList = this.props.pages.map((page) => {
      const pageBody = this.getHighlightBody(page.revision.body);
      //console.log('resultList.page.path', page.path);
      //console.log('resultList.pageBody', pageBody);
      return (
        <div id={page._id}>
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

