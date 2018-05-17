import React from 'react';
import PropTypes from 'prop-types';

// Search.SearchForm
export default class SearchForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: this.props.keyword,
      searchedKeyword: this.props.keyword,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  search() {
    if (this.state.searchedKeyword != this.state.keyword) {
      this.props.onSearchFormChanged({keyword: this.state.keyword});
      this.setState({searchedKeyword: this.state.keyword});
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.search({keyword: this.state.keyword});
  }

  handleChange(event) {
    const keyword = event.target.value;
    this.setState({keyword});
  }

  render() {
    return (
      <form className="form form-group input-group" onSubmit={this.handleSubmit}>
        <input
          type="text"
          name="q"
          value={this.state.keyword}
          onChange={this.handleChange}
          className="form-control"
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

SearchForm.propTypes = {
  keyword: PropTypes.string,
  onSearchFormChanged: PropTypes.func.isRequired,
};
SearchForm.defaultProps = {
};
