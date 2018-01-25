import React from 'react';
import { FormGroup, Button, InputGroup } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import UserPicture from './User/UserPicture';
import PageListMeta from './PageList/PageListMeta';
import PagePath from './PageList/PagePath';
import PropTypes from 'prop-types';

export default class SearchTypeahead extends React.Component {

  constructor(props) {

    super(props);

    this.crowi = window.crowi; // FIXME

    this.state = {
      input: '',
      keyword: '',
      searchedKeyword: '',
      pages: [],
      isLoading: false,
      searchError: null,
    };

    this.search = this.search.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getRestoreFormButton = this.getRestoreFormButton.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.emptyLabel = props.emptyLabel;
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  search(keyword) {

    if (keyword === '') {
      this.setState({
        keyword: '',
        searchedKeyword: '',
      });
      return;
    }

    this.setState({isLoading: true});

    this.crowi.apiGet('/search', {q: keyword})
      .then(res => { this._onSearchSuccess(res) })
      .catch(err => { this._onSearchError(err) });
  }

  /**
   * Occured when search is exit successfully
   * @param {*} pages
   */
  _onSearchSuccess(res) {
    this.setState({
      isLoading: false,
      keyword: '',
      pages: res.data,
    });
    this.props.onSearchSuccess(res);
  }

  /**
   * Occured when search is exit abnormaly
   * @param {*} err
   */
  _onSearchError(err) {
    this.setState({
      isLoading: false,
      searchError: err,
    });
    this.props.onSearchError(err);
  }

  getRestoreFormButton() {
    let isHidden = (this.state.input.length === 0);

    return isHidden ? <span></span> : (
      <a className="btn btn-link search-top-clear" onClick={this.props.onResetButton} hidden={isHidden}>
        <i className="fa fa-times-circle" />
      </a>
    );
  }

  onInputChange(text) {
    this.setState({input: text});
  }

  onChange(selected) {
    const page = selected[0];  // should be single page selected

    // navigate to page
    if (page != null) {
        window.location = page.path;
    }
  }

  renderMenuItemChildren(option, props, index) {
    const page = option;
    return (
      <span>
      <UserPicture user={page.revision.author} />
      <PagePath page={page} />
      <PageListMeta page={page} />
      </span>
    );
  }

  render() {
    const emptyLabel = (this.state.searchError !== null)
        ? 'Error on searching.'
        : 'No matches found on title...';
    const restoreFormButton = this.getRestoreFormButton();
    const keyword = "hoge";

    return (
      <form
        action="/_search"
        className=""
        >
      <AsyncTypeahead
        ref={typeahead => this._typeahead = typeahead}
        inputProps={{name: "q", autoComplete: "off"}}
        isLoading={this.state.isLoading}
        labelKey="path"
        minLength={2}
        options={this.state.pages}
        placeholder="Input page name"
        emptyLabel={this.emptyLabel ? this.emptyLabel : emptyLabel}
        align='left'
        submitFormOnEnter={true}
        onSearch={this.search}
        onInputChange={this.onInputChange}
        renderMenuItemChildren={this.renderMenuItemChildren}
        caseSensitive={false}
      />
      {restoreFormButton}
      <span>keyword: {this.state.keyword}</span>
      </form>
    );
  }
}

SearchTypeahead.propTypes = {
  onSearchSuccess: PropTypes.func,
  onSearchError:   PropTypes.func,
  onResetButton:   PropTypes.func,
  restoreAction:   PropTypes.func,
  emptyLabel:      PropTypes.string,
  keywordOnInit:   PropTypes.string,
};

SearchTypeahead.defaultProps = {
  keywordOnInit:   "",
};
