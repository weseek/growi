import React from 'react';
import PropTypes from 'prop-types';

import { noop } from 'lodash/noop';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import UserPicture from './User/UserPicture';
import PageListMeta from './PageList/PageListMeta';
import PagePath from './PageList/PagePath';

export default class SearchTypeahead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: this.props.keywordOnInit,
      keyword: '',
      searchedKeyword: '',
      pages: [],
      isLoading: false,
      searchError: null,
    };
    this.crowi = this.props.crowi;

    this.restoreInitialData = this.restoreInitialData.bind(this);
    this.search = this.search.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.dispatchSubmit = this.dispatchSubmit.bind(this);
    this.getEmptyLabel = this.getEmptyLabel.bind(this);
    this.getRestoreFormButton = this.getRestoreFormButton.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.getTypeahead = this.getTypeahead.bind(this);
  }

  /**
   * Get instance of AsyncTypeahead
   */
  getTypeahead() {
    return this.refs.typeahead ? this.refs.typeahead.getInstance() : null;
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  /**
   * Initialize keyword
   */
  restoreInitialData() {
    // see https://github.com/ericgio/react-bootstrap-typeahead/issues/266#issuecomment-414987723
    const text = this.props.keywordOnInit;
    const instance = this.refs.typeahead.getInstance();
    instance.clear();
    instance.setState({ text });
  }

  search(keyword) {
    if (keyword === '') {
      this.setState({
        keyword: '',
        searchedKeyword: '',
      });
      return;
    }

    this.setState({ isLoading: true });

    this.crowi.apiGet('/search', { q: keyword })
      .then((res) => { this.onSearchSuccess(res) })
      .catch((err) => { this.onSearchError(err) });
  }

  /**
   * Callback function which is occured when search is exit successfully
   * @param {*} pages
   */
  onSearchSuccess(res) {
    this.setState({
      isLoading: false,
      keyword: '',
      pages: res.data,
    });
    this.props.onSearchSuccess && this.props.onSearchSuccess(res);
  }

  /**
   * Callback function which is occured when search is exit abnormaly
   * @param {*} err
   */
  onSearchError(err) {
    this.setState({
      isLoading: false,
      searchError: err,
    });
    this.props.onSearchError && this.props.onSearchError(err);
  }

  onInputChange(text) {
    this.setState({ input: text });
    this.props.onInputChange(text);
    if (text === '') {
      this.setState({ pages: [] });
    }
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.dispatchSubmit();
    }
  }

  dispatchSubmit() {
    if (this.props.onSubmit != null) {
      this.props.onSubmit(this.state.input);
    }
  }

  getEmptyLabel() {
    // use props.emptyLabel as is if defined
    if (this.props.emptyLabel !== undefined) {
      return this.props.emptyLabel;
    }

    let emptyLabelExceptError = 'No matches found on title...';
    if (this.props.emptyLabelExceptError !== undefined) {
      emptyLabelExceptError = this.props.emptyLabelExceptError;
    }

    return (this.state.searchError !== null)
      ? 'Error on searching.'
      : emptyLabelExceptError;
  }

  /**
   * Get restore form button to initialize button
   */
  getRestoreFormButton() {
    const isHidden = (this.state.input === this.props.keywordOnInit);

    return isHidden ? <span /> : (
      <button type="button" className="btn btn-link search-clear" onMouseDown={this.restoreInitialData}>
        <i className="icon-close" />
      </button>
    );
  }

  renderMenuItemChildren(option, props, index) {
    const page = option;
    return (
      <span>
        <UserPicture user={page.lastUpdateUser} size="sm" />
        <PagePath page={page} />
        <PageListMeta page={page} />
      </span>
    );
  }

  render() {
    const defaultSelected = (this.props.keywordOnInit != '')
      ? [{ path: this.props.keywordOnInit }]
      : [];
    const inputProps = { autoComplete: 'off' };
    if (this.props.inputName != null) {
      inputProps.name = this.props.inputName;
    }

    const restoreFormButton = this.getRestoreFormButton();

    return (
      <div className="search-typeahead">
        <AsyncTypeahead
          {...this.props}
          ref="typeahead"
          inputProps={inputProps}
          isLoading={this.state.isLoading}
          labelKey="path"
          minLength={0}
          options={this.state.pages} // Search result (Some page names)
          emptyLabel={this.getEmptyLabel()}
          searchText={(this.state.isLoading ? 'Searching...' : this.getEmptyLabel())}
              // DIRTY HACK
              //  note: The default searchText string has been shown wrongly even if isLoading is false
              //        since upgrade react-bootstrap-typeahead to v3.3.2 -- 2019.02.05 Yuki Takei
          align="left"
          submitFormOnEnter
          onSearch={this.search}
          onInputChange={this.onInputChange}
          onKeyDown={this.onKeyDown}
          renderMenuItemChildren={this.renderMenuItemChildren}
          caseSensitive={false}
          defaultSelected={defaultSelected}
          promptText={this.props.promptText}
        />
        {restoreFormButton}
      </div>
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
  onChange:        PropTypes.func,
  onSubmit:        PropTypes.func,
  onInputChange:   PropTypes.func,
  inputName:       PropTypes.string,
  emptyLabel:      PropTypes.string,
  emptyLabelExceptError: PropTypes.string,
  placeholder:     PropTypes.string,
  keywordOnInit:   PropTypes.string,
  promptText:      PropTypes.object,
};

/**
 * Properties
 */
SearchTypeahead.defaultProps = {
  onSearchSuccess: noop,
  onSearchError:   noop,
  onChange:        noop,
  placeholder:     '',
  keywordOnInit:   '',
  onInputChange: () => {},
};
