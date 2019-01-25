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
      searchError: null,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  search(keyword) {
    if (this.state.searchedKeyword != keyword) {
      this.props.onSearchFormChanged({keyword: keyword});
      this.setState({searchedKeyword: keyword});
    }
  }

  onSubmit(event) {
    if (event !== '') {
      event.preventDefault(); // prevent refreshing page of form tag
    }
    const input = this.refs.searchTypeahead.state.input;
    this.setState({keyword: input});
    this.search(input);
  }

  render() {
    return (
      <form ref='form'
      className="form form-group input-group"
       onSubmit={this.onSubmit}>
        <SearchForm
          ref='searchTypeahead'
          crowi={this.props.crowi}
          onSubmit={this.onSubmit}
          keyword={this.state.keyword}
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
