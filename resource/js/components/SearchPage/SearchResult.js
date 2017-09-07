import React from 'react';
import PropTypes from 'prop-types';

import Page from '../PageList/Page';
import SearchResultList from './SearchResultList';
import SearchResultInput from './SearchResultInput';

// Search.SearchResult
export default class SearchResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deletionMode : false,
      selectedPages : new Set(),
    }
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
  }

  isNotSearchedYet() {
    return !this.props.searchResultMeta.took;
  }

  isNotFound() {
    return this.props.searchingKeyword !== '' && this.props.pages.length === 0;
  }

  isError() {
    if (this.props.searchError !== null) {
      return true;
    }
    return false;
  }

  toggleCheckbox(page) {
    if (this.state.selectedPages.has(page)) {
      this.state.selectedPages.delete(page);
    } else {
      this.state.selectedPages.add(page);
    }
  }

  handleDeletionModeChange() {
    this.setState({deletionMode: !this.state.deletionMode});
  }

  render() {
    const excludePathString = this.props.tree;

    //console.log(this.props.searchError);
    //console.log(this.isError());
    if (this.isError()) {
      return (
        <div className="content-main">
          <i className="searcing fa fa-warning"></i> Error on searching.
        </div>
      );
    }

    if (this.isNotSearchedYet()) {
      return <div />;
    }

    if (this.isNotFound()) {
      let under = '';
      if (this.props.tree !== '') {
        under = ` under "${this.props.tree}"`;
      }
      return (
        <div className="content-main">
            <i className="fa fa-meh-o" /> No page found with "{this.props.searchingKeyword}"{under}
        </div>
      );

    }

    let deletionModeButtons = '';

    if (this.state.deletionMode) {
      deletionModeButtons =
      <div className="btn-group">
        <button type="button" className="btn btn-danger" data-target="#deletePages" data-toggle="modal"><i className="fa fa-trash-o"/> Delete</button>
        <button type="button" className="btn btn-default" onClick={() => this.handleDeletionModeChange()}><i className="fa fa-undo"/> Cancel</button>
      </div>
    }
    else {
      deletionModeButtons =
      <div className="btn-group">
        <button type="button" className="btn btn-default" onClick={() => this.handleDeletionModeChange()}><i className="fa fa-trash-o"/> DeletionMode</button>
      </div>
    }

    const listView = this.props.pages.map((page) => {
      const pageId = "#" + page._id;
      return (
        <Page page={page}
          linkTo={pageId}
          key={page._id}
          excludePathString={excludePathString}
          >
          <SearchResultInput
            page={page}
            deletionMode={this.state.deletionMode}
            handleCheckboxChange={this.toggleCheckbox}/>
          <div className="page-list-option">
            <a href={page.path}><i className="fa fa-arrow-circle-right" /></a>
          </div>
        </Page>
      );
    });

    // TODO あとでなんとかする
    setTimeout(() => {
      $('#search-result-list > nav').affix({ offset: { top: 120 }});
    }, 1200);

    /*
    UI あとで考える
    <span className="search-result-meta">Found: {this.props.searchResultMeta.total} pages with "{this.props.searchingKeyword}"</span>
    */
    return (
      <div className="content-main">
        <div className="search-result row" id="search-result">
          <div className="col-md-4 hidden-xs hidden-sm page-list search-result-list" id="search-result-list">
            <nav data-spy="affix" data-offset-top="120">
              {deletionModeButtons}
              <ul className="page-list-ul page-list-ul-flat nav">
                {listView}
              </ul>
            </nav>
          </div>
          <div className="col-md-8 search-result-content" id="search-result-content">
            <div className="search-result-meta"><i className="fa fa-lightbulb-o" /> Found {this.props.searchResultMeta.total} pages with "{this.props.searchingKeyword}"</div>
            <SearchResultList
              pages={this.props.pages}
              searchingKeyword={this.props.searchingKeyword}
              />
          </div>
        </div>
      </div>
    );
  }
}

SearchResult.propTypes = {
  tree: PropTypes.string.isRequired,
  pages: PropTypes.array.isRequired,
  searchingKeyword: PropTypes.string.isRequired,
  searchResultMeta: PropTypes.object.isRequired,
};
SearchResult.defaultProps = {
  tree: '',
  pages: [],
  searchingKeyword: '',
  searchResultMeta: {},
  searchError: null,
};
