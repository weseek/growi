import React from 'react';
import { FormGroup, Button, InputGroup } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import UserPicture from './User/UserPicture';
import PageListMeta from './PageList/PageListMeta';
import PagePath from './PageList/PagePath';
import PropTypes from 'prop-types';
import SearchTypeahead from './SearchTypeahead';

export default class NewPageNameInputter extends React.Component {

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

    this.crowi = window.crowi; // FIXME

    this.onSearchSuccess = this.onSearchSuccess.bind(this);
    this.onSearchError = this.onSearchError.bind(this);
    this.restoreForm = this.restoreForm.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  onSearchSuccess(res) {
    this.setState({
      isLoading: false,
      keyword: '',
      pages: res.data,
    });
  }

  onSearchError(err) {
    this.setState({
      isLoading: false,
      searchError: err,
    });
  }

  onInputChange(text) {
    this.setState({input: text});
  }

  restoreForm() {
    this._searchtypeahead._typeahead.getInstance().clear();
    this._searchtypeahead._typeahead.getInstance().input = 'hoge';
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

    return (
      <SearchTypeahead
        ref={searchTypeahead => this._searchtypeahead = searchTypeahead}
        crowi={this.crowi}
        onSearchSuccess={this.onSearchSuccess}
        onSearchError={this.onSearchError}
        onResetButton={this.restoreForm}
        emptyLabel={emptyLabel}
        keywordOnInit={this.props.parentPageName}
      />
    );
  }
}

NewPageNameInputter.propTypes = {
  parentPageName: PropTypes.string.isRequired,
};
NewPageNameInputter.defaultProps = {
  parentPageName: "",
};
