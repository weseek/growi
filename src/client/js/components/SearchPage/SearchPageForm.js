import React from 'react';
import PropTypes from 'prop-types';
import SearchForm from '../SearchForm';

// Search.SearchForm
export default class SearchPageForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchedKeyword: this.props.keyword,
    };

    this.search = this.search.bind(this);
  }

  search(keyword) {
    if (this.state.searchedKeyword != keyword) {
      this.props.onSearchFormChanged({keyword: keyword});
      this.setState({searchedKeyword: keyword});
    }
  }

  render() {
    return (
      <form ref='form'
        className="form form-group input-group"
        onSubmit={this.onSubmit}
      >
        <SearchForm
          ref='searchForm'
          crowi={this.props.crowi}
          onSubmit={this.search}
          keyword={this.state.searchedKeyword}
        />
        <span className="input-group-btn">
          <button type="submit" className="btn btn-default">
            <i className="search-top-icon icon-magnifier"></i>
          </button>
        </span>
      </form>
    );
  }
}

SearchPageForm.propTypes = {
  crowi: PropTypes.object.isRequired,
  keyword: PropTypes.string,
  onSearchFormChanged: PropTypes.func.isRequired,
};
SearchPageForm.defaultProps = {
};
