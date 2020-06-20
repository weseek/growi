import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import SearchForm from '../SearchForm';

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
    const keyword = this.state.keyword;
    this.props.onSearchFormChanged({ keyword });
    this.setState({ searchedKeyword: keyword });
  }

  onInputChange(input) { // for only submitting with button
    this.setState({ keyword: input });
  }

  render() {
    return (
      <div className="input-group mb-3 d-flex">
        <div className="flex-fill">
          <SearchForm
            t={this.props.t}
            onSubmit={this.search}
            keyword={this.state.searchedKeyword}
            onInputChange={this.onInputChange}
          />
        </div>
        <div className="input-group-append">
          <button className="btn btn-secondary" type="button" id="button-addon2" onClick={this.search}>
            <i className="icon-magnifier"></i>
          </button>
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SearchPageFormWrapper = withUnstatedContainers(SearchPageForm, [AppContainer]);

SearchPageForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  keyword: PropTypes.string,
  onSearchFormChanged: PropTypes.func.isRequired,
};
SearchPageForm.defaultProps = {
};

export default SearchPageFormWrapper;
