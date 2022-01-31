import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import SearchForm from '../SearchForm';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:searchPageForm');

// Search.SearchForm
class SearchPageForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: this.props.keyword,
      searchedKeyword: this.props.keyword,
    };

    this.search = this.search.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  search() {
    if (this.props.onSearchFormChanged != null) {
      const keyword = this.state.keyword;
      const {
        order, sort, excludeUserPages, excludeTrashPages,
      } = this.props.searchOptions || null;

      this.props.onSearchFormChanged({
        keyword, order, sort, excludeTrashPages, excludeUserPages,
      });
      this.setState({ searchedKeyword: keyword });
    }
    else {
      throw new Error('onSearchFormChanged method is null');
    }
  }

  onInputChange(input) { // for only submitting with button
    this.setState({ keyword: input });
  }

  render() {
    const { appContainer } = this.props;
    const isSearchServiceReachable = appContainer.getConfig().isSearchServiceReachable;

    return (
      <SearchForm
        isSearchServiceReachable={isSearchServiceReachable}
        onSubmit={this.search}
        keyword={this.state.searchedKeyword}
        onInputChange={this.onInputChange}
      />
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SearchPageFormWrapper = withUnstatedContainers(SearchPageForm, [AppContainer]);

SearchPageForm.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  keyword: PropTypes.string,
  onSearchFormChanged: PropTypes.func,
  searchOptions: PropTypes.object,
};
SearchPageForm.defaultProps = {
};

export default SearchPageFormWrapper;
