import React from 'react';
import PropTypes from 'prop-types';
import SearchForm from '../SearchForm';

// Search.SearchForm
export default class SearchPageForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: this.props.keyword,
      searchedKeyword: this.props.keyword,
    };

    this.search = this.search.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  search(keyword) {
    if (this.state.searchedKeyword != keyword) {
      this.props.onSearchFormChanged({keyword: keyword});
      this.setState({searchedKeyword: keyword});
    }
  }

  onSubmit(event) { // submit with button
    event.preventDefault(); // prevent refreshing page
    this.search(this.state.keyword);
  }

  onInputChange(input) { // for only submitting with button
    this.setState({keyword: input});
  }

  render() {
    return (
      <form ref='form'
        className="form form-group input-group"
        onSubmit={this.onSubmit}
      >
        <SearchForm
          crowi={this.props.crowi}
          onSubmit={this.search}
          keyword={this.state.searchedKeyword}
          onInputChange={this.onInputChange}
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
