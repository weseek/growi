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
import PageDeleteModal from './PageDeleteModal';

import { CheckboxType } from '../interfaces/search';

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
      searchResults: [],
      searchResultMeta: {},
      focusedSearchResultData: null,
      selectedPagesIdList: new Set(),
      searchResultCount: 0,
      activePage: 1,
      pagingLimit: this.props.appContainer.config.pageLimitationL || 50,
      excludeUserPages: true,
      excludeTrashPages: true,
      selectAllCheckboxType: CheckboxType.NONE_CHECKED,
      isDeleteConfirmModalShown: false,
      deleteTargetPageIds: new Set(),
    };

    this.changeURL = this.changeURL.bind(this);
    this.search = this.search.bind(this);
    this.onSearchInvoked = this.onSearchInvoked.bind(this);
    this.selectPage = this.selectPage.bind(this);
    this.toggleCheckBox = this.toggleCheckBox.bind(this);
    this.switchExcludeUserPagesHandler = this.switchExcludeUserPagesHandler.bind(this);
    this.switchExcludeTrashPagesHandler = this.switchExcludeTrashPagesHandler.bind(this);
    this.onPagingNumberChanged = this.onPagingNumberChanged.bind(this);
    this.onPagingLimitChanged = this.onPagingLimitChanged.bind(this);
    this.deleteSinglePageButtonHandler = this.deleteSinglePageButtonHandler.bind(this);
    this.deleteAllPagesButtonHandler = this.deleteAllPagesButtonHandler.bind(this);
    this.closeDeleteConfirmModalHandler = this.closeDeleteConfirmModalHandler.bind(this);
  }

  componentDidMount() {
    const keyword = this.state.searchingKeyword;
    if (keyword !== '') {
      this.search({ keyword });
    }
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

  switchExcludeUserPagesHandler() {
    this.setState({ excludeUserPages: !this.state.excludeUserPages });
  }

  switchExcludeTrashPagesHandler() {
    this.setState({ excludeTrashPages: !this.state.excludeTrashPages });
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
    if (this.state.excludeTrashPages) {
      query = `${query} -prefix:${specificPathNames.trash}`;
    }
    if (this.state.excludeUserPages) {
      query = `${query} -prefix:${specificPathNames.user}`;
    }

    return query;
  }

  /**
   * this method is called when user changes paging number
   */
  async onPagingNumberChanged(activePage) {
    this.setState({ activePage }, () => this.search({ keyword: this.state.searchedKeyword }));
  }

  /**
   * this method is called when user searches by pressing Enter or using searchbox
   */
  async onSearchInvoked(data) {
    this.setState({ activePage: 1 }, () => this.search(data));
  }

  /**
   * change number of pages to display per page and execute search method after.
   */
  async onPagingLimitChanged(limit) {
    this.setState({ pagingLimit: limit }, () => this.search({ keyword: this.state.searchedKeyword }));
  }

  // todo: refactoring
  // refs: https://redmine.weseek.co.jp/issues/82139
  async search(data) {
    const keyword = data.keyword;
    if (keyword === '') {
      this.setState({
        searchingKeyword: '',
        searchedKeyword: '',
        searchResults: [],
        searchResultMeta: {},
        searchResultCount: 0,
        activePage: 1,
      });

      return true;
    }

    this.setState({
      searchingKeyword: keyword,
    });
    const pagingLimit = this.state.pagingLimit;
    const offset = (this.state.activePage * pagingLimit) - pagingLimit;
    try {
      const res = await this.props.appContainer.apiGet('/search', {
        q: this.createSearchQuery(keyword),
        limit: pagingLimit,
        offset,
      });
      this.changeURL(keyword);
      if (res.data.length > 0) {
        this.setState({
          searchedKeyword: keyword,
          searchResults: res.data,
          searchResultMeta: res.meta,
          searchResultCount: res.meta.total,
          focusedSearchResultData: res.data[0],
          // reset active page if keyword changes, otherwise set the current state
          activePage: this.state.searchedKeyword === keyword ? this.state.activePage : 1,
        });
      }
      else {
        this.setState({
          searchedKeyword: keyword,
          searchResults: [],
          searchResultMeta: {},
          searchResultCount: 0,
          focusedSearchResultData: {},
          activePage: 1,
        });
      }
    }
    catch (err) {
      toastError(err);
    }
  }

  selectPage= (pageId) => {
    const index = this.state.searchResults.findIndex(({ pageData }) => {
      return pageData._id === pageId;
    });
    this.setState({
      focusedSearchResultData: this.state.searchResults[index],
    });
  }

  toggleCheckBox = (pageId) => {
    const { selectedPagesIdList } = this.state;

    if (selectedPagesIdList.has(pageId)) {
      selectedPagesIdList.delete(pageId);
    }
    else {
      selectedPagesIdList.add(pageId);
    }
    switch (selectedPagesIdList.size) {
      case 0:
        return this.setState({ selectAllCheckboxType: CheckboxType.NONE_CHECKED });
      case this.state.searchResults.length:
        return this.setState({ selectAllCheckboxType: CheckboxType.ALL_CHECKED });
      default:
        return this.setState({ selectAllCheckboxType: CheckboxType.INDETERMINATE });
    }
  }

  toggleAllCheckBox = (nextSelectAllCheckboxType) => {
    const { selectedPagesIdList, searchResults } = this.state;
    if (nextSelectAllCheckboxType === CheckboxType.NONE_CHECKED) {
      selectedPagesIdList.clear();
    }
    else {
      searchResults.forEach((page) => {
        selectedPagesIdList.add(page.pageData._id);
      });
    }
    this.setState({
      selectedPagesIdList,
      selectAllCheckboxType: nextSelectAllCheckboxType,
    });
  };

  getSelectedPagesToDelete() {
    const filteredPages = this.state.searchResults.filter((page) => {
      return Array.from(this.state.deleteTargetPageIds).find(id => id === page.pageData._id);
    });
    return filteredPages.map(page => ({
      pageId: page.pageData._id,
      revisionId: page.pageData.revision,
      path: page.pageData.path,
    }));
  }

  deleteSinglePageButtonHandler(pageId) {
    this.setState({ deleteTargetPageIds: new Set([pageId]) });
    this.setState({ isDeleteConfirmModalShown: true });
  }

  deleteAllPagesButtonHandler() {
    if (this.state.selectedPagesIdList.size === 0) { return }
    this.setState({ deleteTargetPageIds: this.state.selectedPagesIdList });
    this.setState({ isDeleteConfirmModalShown: true });
  }

  closeDeleteConfirmModalHandler() {
    this.setState({ isDeleteConfirmModalShown: false });
  }

  renderSearchResultContent = () => {
    return (
      <SearchResultContent
        appContainer={this.props.appContainer}
        searchingKeyword={this.state.searchingKeyword}
        focusedSearchResultData={this.state.focusedSearchResultData}
      >
      </SearchResultContent>
    );
  }

  renderSearchResultList = () => {
    return (
      <SearchResultList
        pages={this.state.searchResults || []}
        focusedSearchResultData={this.state.focusedSearchResultData}
        selectedPagesIdList={this.state.selectedPagesIdList || []}
        searchResultCount={this.state.searchResultCount}
        activePage={this.state.activePage}
        pagingLimit={this.state.pagingLimit}
        onClickSearchResultItem={this.selectPage}
        onClickCheckbox={this.toggleCheckBox}
        onPagingNumberChanged={this.onPagingNumberChanged}
        onClickDeleteButton={this.deleteSinglePageButtonHandler}
      />
    );
  }

  renderSearchControl = () => {
    return (
      <SearchControl
        searchingKeyword={this.state.searchingKeyword}
        searchResultCount={this.state.searchResultCount || 0}
        appContainer={this.props.appContainer}
        onSearchInvoked={this.onSearchInvoked}
        onClickSelectAllCheckbox={this.toggleAllCheckBox}
        selectAllCheckboxType={this.state.selectAllCheckboxType}
        onClickDeleteAllButton={this.deleteAllPagesButtonHandler}
        onExcludeUserPagesSwitched={this.switchExcludeUserPagesHandler}
        onExcludeTrashPagesSwitched={this.switchExcludeTrashPagesHandler}
        excludeUserPages={this.state.excludeUserPages}
        excludeTrashPages={this.state.excludeTrashPages}
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
          onPagingLimitChanged={this.onPagingLimitChanged}
          pagingLimit={this.state.pagingLimit}
          activePage={this.state.activePage}
        >
        </SearchPageLayout>
        <PageDeleteModal
          isOpen={this.state.isDeleteConfirmModalShown}
          onClose={this.closeDeleteConfirmModalHandler}
          pages={this.getSelectedPagesToDelete()}
        />
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
