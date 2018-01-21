import React from 'react';
import { FormGroup, Button, InputGroup } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import UserPicture from './User/UserPicture';
import PageListMeta from './PageList/PageListMeta';
import PagePath from './PageList/PagePath';
import PropTypes from 'prop-types';

// Header.SearchForm
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

    this.search = this.search.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.getFormClearComponent = this.getFormClearComponent.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
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
      .then(res => {
        this.setState({
          isLoading: false,
          keyword: '',
          pages: res.data,
        });
      })
      .catch(err => {
        this.setState({
          isLoading: false,
          searchError: err,
        });
      });
  }

  getFormClearComponent() {
    let isHidden = (this.state.input.length === 0);

    return isHidden ? <span></span> : (
      <a className="btn btn-link search-top-clear" onClick={this.clearForm} hidden={isHidden}>
        <i className="fa fa-times-circle" />
      </a>
    );
  }

  clearForm() {
    this._typeahead.getInstance().clear();
    this.setState({keyword: ''});
  }

  onInputChange(text) {
    this.setState({input: text});
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
    const formClear = this.getFormClearComponent();

    return (
      <form
        action="/_search"
        className="search-form input-group"
      >
        <InputGroup>
        <AsyncTypeahead
            ref={ref => this._typeahead = ref}
            inputProps={{name: "q", autoComplete: "off"}}
            isLoading={this.state.isLoading}
            labelKey="path"
            minLength={2}
            options={this.state.pages}
            placeholder="Input page name"
            emptyLabel={emptyLabel}
            align='left'
            submitFormOnEnter={true}
            onSearch={this.search}
            onInputChange={this.onInputChange}
            renderMenuItemChildren={this.renderMenuItemChildren}
        />
        {formClear}
        <input
            type="hidden"
            value={this.state.searchedKeyword}
            required />
        </InputGroup>

      </form>

    );
  }
}

NewPageNameInputter.propTypes = {
};

NewPageNameInputter.defaultProps = {
};
