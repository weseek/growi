import React from 'react';

export default class SearchForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
      searchedKeyword: '',
    };

    this.handleSubmit= this.handleSubmit.bind(this);
    this.handleChange= this.handleChange.bind(this);
  }

  componentDidMount() {
    setInterval(this.searchFieldTicker.bind(this), this.props.pollInterval);
  }

  searchFieldTicker() {
    if (this.state.searchedKeyword != this.state.keyword) {
      this.props.onSearchFormChanged({keyword: this.state.keyword});
      this.setState({searchedKeyword: this.state.keyword});
    }
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  handleChange(event) {
    const keyword = event.target.value;
    this.setState({keyword});
  }

  render() {
    return (
      <form
        className="search-form form-group input-group search-top-input-group"
        onSubmit={this.handleSubmit}
      >
        <input type="text" className="search-top-input form-control" placeholder="Search ..."
          value={this.state.keyword}
          onChange={this.handleChange}
        />
        <span className="input-group-btn">
          <button type="submit" className="btn btn-default" type="button">
            <i className="search-top-icon fa fa-search"></i>
          </button>
        </span>
      </form>
    );
  }
}

SearchForm.propTypes = {
  onSearchFormChanged: React.PropTypes.func.isRequired,
  pollInterval: React.PropTypes.number,
};
SearchForm.defaultProps = {
  pollInterval: 1000,
};
