// This is the root component for #search-page

import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';

import { toastError } from '~/client/util/apiNotification';
import SearchPageLayout from './SearchPage/SearchPageLayout';
import SearchResultContent from './SearchPage/SearchResultContent';
import SearchResultList from './SearchPage/SearchResultList';
import SearchControl from './SearchPage/SearchControl';
import PaginationWrapper from './PaginationWrapper';

export const specificPathNames = {
  user: '/user',
  trash: '/trash',
};

class SearchPage extends React.Component {

  constructor(props) {
    super(props);
    // NOTE : selectedPages is deletion related state, will be used later in story 77535, 77565.
    // deletionModal, deletion related functions are all removed, add them back when necessary.
    // i.e ) in story 77525 or any tasks implementing deletion functionalities
    this.state = {
      searchingKeyword: decodeURI(this.props.query.q) || '',
      searchedKeyword: '',
      searchedPages: [],
      searchResultMeta: {},
      selectedPage: {},
      selectedPages: new Set(),
      searchResultCount: 0,
      activePage: 1,
      pagingLimit: 0,
      excludeUsersHome: true,
      excludeTrash: true,
    };

    this.changeURL = this.changeURL.bind(this);
    this.search = this.search.bind(this);
    this.selectPage = this.selectPage.bind(this);
    this.toggleCheckBox = this.toggleCheckBox.bind(this);
    this.onExcludeUsersHome = this.onExcludeUsersHome.bind(this);
    this.onExcludeTrash = this.onExcludeTrash.bind(this);
    this.onPageChagned = this.onPageChagned.bind(this);
    this.getDisplayPages = this.getDisplayPages.bind(this);

  }

  componentDidMount() {
    const keyword = this.state.searchingKeyword;
    if (keyword !== '') {
      this.search({ keyword });
    }
    this.setState({
      pagingLimit: 2, // change to an appropriate limit number
    });
  }

  static getQueryByLocation(location) {
    const search = location.search || '';
    const query = {};

    search.replace(/^\?/, '').split('&').forEach((element) => {
      const queryParts = element.split('=');
      query[queryParts[0]] = decodeURIComponent(queryParts[1]).replace(/\+/g, ' ');
    });

    return query;
  }

  onExcludeUsersHome() {
    this.setState({ excludeUsersHome: !this.state.excludeUsersHome });
  }

  onExcludeTrash() {
    this.setState({ excludeTrash: !this.state.excludeTrash });
  }

  changeURL(keyword, refreshHash) {
    let hash = window.location.hash || '';
    // TODO 整理する
    if (refreshHash || this.state.searchedKeyword !== '') {
      hash = '';
    }
    if (window.history && window.history.pushState) {
      window.history.pushState('', `Search - ${keyword}`, `/_search?q=${keyword}${hash}`);
    }
  }

  createSearchQuery(keyword) {
    let query = keyword;

    // pages included in specific path are not retrived when prefix is added
    if (this.state.excludeTrash) {
      query = `${query} -prefix:${specificPathNames.trash}`;
    }
    if (this.state.excludeUsersHome) {
      query = `${query} -prefix:${specificPathNames.user}`;
    }

    return query;
  }

  search(data) {
    const keyword = data.keyword;
    if (keyword === '') {
      this.setState({
        searchingKeyword: '',
        searchedKeyword: '',
        searchedPages: [],
        searchResultMeta: {},
        searchResultCount: 0,
        activePage: 1,
      });

      return true;
    }

    this.setState({
      searchingKeyword: keyword,
    });
    this.props.appContainer.apiGet('/search', { q: this.createSearchQuery(keyword) })
      .then((res) => {
        this.changeURL(keyword);
        if (res.data.length > 0) {
          // TODO: remove creating dummy snippet lines when the data with snippet is abole to be retrieved
          res.data.forEach((page) => {
            page.snippet = `dummy snippet dummpy snippet dummpy snippet dummpy snippet dummpy snippet
            dummpy snippet dummpy snippet dummpy snippet dummpy snippet`;
          });
          this.setState({
            searchedKeyword: keyword,
            searchedPages: res.data,
            searchResultMeta: res.meta,
            searchResultCount: res.totalCount,
            selectedPage: res.data[0],
            activePage: 1,
          });
        }
        else {
          this.setState({
            searchedKeyword: keyword,
            searchedPages: [],
            searchResultMeta: {},
            searchResultCount: res.totalCount,
            selectedPage: {},
            activePage: 1,
          });
        }
      })
      .catch((err) => {
        toastError(err);
      });
  }

  selectPage= (pageId) => {
    const index = this.state.searchedPages.findIndex((page) => {
      return page._id === pageId;
    });
    this.setState({
      selectedPage: this.state.searchedPages[index],
    });
  }

  toggleCheckBox = (page) => {
    if (this.state.selectedPages.has(page)) {
      this.state.selectedPages.delete(page);
    }
    else {
      this.state.selectedPages.add(page);
    }
  }

  onPageChagned = (selectedPage) => {
    this.setState({
      activePage: selectedPage,
    });
  }

  getDisplayPages = () => {
    // return empty array if no pages returned
    if (this.state.searchResultCount === 0) return [];

    const end = this.state.activePage * this.state.pagingLimit;
    const start = end - this.state.pagingLimit;
    return this.state.searchedPages.slice(start, end);
  }

  renderSearchResultContent = () => {
    return (
      <SearchResultContent
        appContainer={this.props.appContainer}
        searchingKeyword={this.state.searchingKeyword}
        selectedPage={this.state.selectedPage}
      >
      </SearchResultContent>
    );
  }

  renderSearchResultList = () => {
    return (
      <>
        <SearchResultList
          pages={this.getDisplayPages()}
          deletionMode={false}
          selectedPage={this.state.selectedPage}
          selectedPages={this.state.selectedPages}
          onClickInvoked={this.selectPage}
          onChangedInvoked={this.toggleCheckBox}
        >
        </SearchResultList>
        <div className="my-4 mx-auto">
          <PaginationWrapper
            activePage={this.state.activePage}
            changePage={this.onPageChagned}
            totalItemsCount={this.state.searchResultCount}
            pagingLimit={this.state.pagingLimit}
          />
        </div>
      </>
    );
  }

  renderSearchControl = () => {
    return (
      <SearchControl
        searchingKeyword={this.state.searchingKeyword}
        appContainer={this.props.appContainer}
        onSearchInvoked={this.search}
        onExcludeUsersHome={this.onExcludeUsersHome}
        onExcludeTrash={this.onExcludeTrash}
      >
      </SearchControl>
    );
  }

  render() {
    return (
      <div>
        <SearchPageLayout
          SearchControl={this.renderSearchControl}
          SearchResultList={this.renderSearchResultList}
          SearchResultContent={this.renderSearchResultContent}
          searchResultMeta={this.state.searchResultMeta}
          searchingKeyword={this.state.searchedKeyword}
        >
        </SearchPageLayout>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SearchPageWrapper = withUnstatedContainers(SearchPage, [AppContainer]);

SearchPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  query: PropTypes.object,
};
SearchPage.defaultProps = {
  // pollInterval: 1000,
  query: SearchPage.getQueryByLocation(window.location || {}),
};

export default withTranslation()(SearchPageWrapper);
