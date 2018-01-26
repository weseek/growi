import React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import UserPicture from './User/UserPicture';
import PageListMeta from './PageList/PageListMeta';
import PagePath from './PageList/PagePath';
import PropTypes from 'prop-types';

export default class SearchTypeahead extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      input: '',
      keyword: '',
      searchedKeyword: '',
      pages: [],
      isLoading: false,
      searchError: null,
    };
    this.crowi = this.props.crowi;
    this.emptyLabel = props.emptyLabel;

    this.search = this.search.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getRestoreFormButton = this.getRestoreFormButton.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.restoreInitialData = this.restoreInitialData.bind(this);
    this.getTypeahead = this.getTypeahead.bind(this);
    this.forceToFocus = this.forceToFocus.bind(this);
  }

  /**
   * Get instance of AsyncTypeahead
   */
  getTypeahead() {
    return this.refs.typeahead ? this.refs.typeahead.getInstance() : null;
  }

  componentDidMount() {
    /*
    this.forceToFocus(); // cf. It is needed for displaing placeholder.
                         //     And cannot focus on if set autoFocus=true to AsyncTypeahead,
                         //       also set to inputProps of AsyncTypeahead.
    */
  }

  componentWillUnmount() {
  }

  /**
   * force to focus
   */
  forceToFocus() {
    const typeahead = this.getTypeahead();
    const intervalId = setInterval(() => {
      this.getTypeahead().focus();
      if (typeahead.state.isFocused) {
        clearInterval(intervalId);
      }
    }, 100);
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
   * Callback function which is occured when search is exit successfully
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
   * Callback function which is occured when search is exit abnormaly
   * @param {*} err
   */
  _onSearchError(err) {
    this.setState({
      isLoading: false,
      searchError: err,
    });
    this.props.onSearchError(err);
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

  /**
   * Initialize keyword
   */
  restoreInitialData() {
    this.refs.typeahead.getInstance().clear();
    this.refs.typeahead.getInstance()._updateText(this.props.keywordOnInit);
  }

  /**
   * Get restore form button to initialize button
   */
  getRestoreFormButton() {
    let isHidden = (this.state.input.length === 0);

    return isHidden ? <span></span> : (
      <a className="btn btn-link search-top-clear" onClick={this.restoreInitialData} hidden={isHidden}>
        <i className="fa fa-times-circle" />
      </a>
    );
  }

  render() {
    const emptyLabel = (this.state.searchError !== null)
      ? 'Error on searching.'
      : 'No matches found on title...';
    const restoreFormButton = this.getRestoreFormButton();

    return (
      <form
        action="/_search"
        className=""
        >
      <AsyncTypeahead
        ref="typeahead"
        inputProps={{name: "q", autoComplete: "off"}}
        isLoading={this.state.isLoading}
        labelKey="path"
        minLength={2}
        options={this.state.pages} // Search result (Some page names)
        placeholder="Input page name"
        emptyLabel={this.emptyLabel ? this.emptyLabel : emptyLabel}
        align='left'
        submitFormOnEnter={true}
        onSearch={this.search}
        onInputChange={this.onInputChange}
        renderMenuItemChildren={this.renderMenuItemChildren}
        caseSensitive={false}
        defaultSelected={[{path: this.props.keywordOnInit}]}
      />
      {restoreFormButton}
      {/* [TODO] デバッグ用の表示。実装が完了したら削除する。 */}
      <span>keyword: {this.state.keyword}, keywordOnInit: {this.props.keywordOnInit}, typeahead.state.isFocused: {this.getTypeahead() ? this.refs.typeahead.state.isFocused : '-' }</span>
      </form>
    );
  }
}

/**
 * Properties
 */
SearchTypeahead.propTypes = {
  crowi:           PropTypes.object.isRequired,
  onSearchSuccess: PropTypes.func,
  onSearchError:   PropTypes.func,
  emptyLabel:      PropTypes.string,
  keywordOnInit:   PropTypes.string,
};

/**
 * Properties
 */
SearchTypeahead.defaultProps = {
  onSearchSuccess: {},
  onSearchError:   {},
  emptyLabel:      null,
  keywordOnInit:   "",
};
