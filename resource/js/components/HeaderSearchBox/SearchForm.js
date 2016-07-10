import React from 'react';

// Header.SearchForm
export default class SearchForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
      searchedKeyword: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.ticker = null;
  }

  componentDidMount() {
    this.ticker = setInterval(this.searchFieldTicker.bind(this), this.props.pollInterval);
  }

  componentWillUnmount() {
    clearInterval(this.ticker);
  }

  search() {
    if (this.state.searchedKeyword != this.state.keyword) {
      this.props.onSearchFormChanged({keyword: this.state.keyword});
      this.setState({searchedKeyword: this.state.keyword});
    }
  }

  getFormClearComponent() {
    if (this.state.keyword !== '') {
      return <a className="search-top-clear" onClick={this.clearForm}><i className="fa fa-times-circle" /></a>;

    } else {
      return '';
    }
  }

  clearForm() {
    this.setState({keyword: ''});
    this.search();
  }

  searchFieldTicker() {
    this.search();
  }

  handleFocus(event) {
    this.props.isShown(true);
  }

  handleBlur(event) {
    //this.props.isShown(false);
  }

  handleChange(event) {
    const keyword = event.target.value;
    this.setState({keyword});
  }

  render() {
    const formClear = this.getFormClearComponent();

    return (
      <form
        action="/_search"
        className="search-form form-group input-group search-top-input-group"
      >
        <input
          autocomplete="off"
          type="text"
          className="search-top-input form-control"
          placeholder="Search ... Page Title (Path) and Content"
          name="q"
          value={this.state.keyword}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
        />
        <span className="input-group-btn">
          <button type="submit" className="btn btn-default">
            <i className="search-top-icon fa fa-search"></i>
          </button>
        </span>
        {formClear}
      </form>
    );
  }
}

SearchForm.propTypes = {
  onSearchFormChanged: React.PropTypes.func.isRequired,
  isShown: React.PropTypes.func.isRequired,
  pollInterval: React.PropTypes.number,
};
SearchForm.defaultProps = {
  pollInterval: 1000,
};
