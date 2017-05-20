import React from 'react';
import { FormGroup, Button, InputGroup } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import axios from 'axios'

import UserPicture from '../User/UserPicture';
import PageListMeta from '../PageList/PageListMeta';
import PagePath from '../PageList/PagePath';
import PropTypes from 'prop-types';

// Header.SearchForm
export default class SearchForm extends React.Component {

  constructor(props) {
    super(props);

    this.crowi = window.crowi; // FIXME

    this.state = {
      input: '',
      keyword: '',
      searchedKeyword: '',
      pages: [],
      searchError: null,
    };

    this.search = this.search.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.getFormClearComponent = this.getFormClearComponent.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onChange = this.onChange.bind(this);
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

    this.crowi.apiGet('/search', {q: keyword})
      .then(res => {
        this.setState({
          keyword: '',
          pages: res.data,
        });
      }).catch(err => {
        this.setState({
          searchError: err
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

  onChange(options) {
    const page = options[0];  // should be single page selected
    // navigate to page
    window.location = page.path;
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
        : 'No matches found on title... Hit [Enter] key so that search on contents.';
    const formClear = this.getFormClearComponent();

    return (
      <form
        action="/_search"
        className="search-form form-group input-group search-top-input-group"
      >
        <FormGroup>
          <InputGroup>
            <AsyncTypeahead
              ref={ref => this._typeahead = ref}
              name="q"
              labelKey="path"
              minLength={2}
              options={this.state.pages}
              placeholder="Search ..."
              emptyLabel={emptyLabel}
              align='left'
              submitFormOnEnter={true}
              onSearch={this.search}
              onInputChange={this.onInputChange}
              onChange={this.onChange}
              renderMenuItemChildren={this.renderMenuItemChildren}
            />
            {formClear}
            <InputGroup.Button>
              <Button type="submit">
                <i className="search-top-icon fa fa-search"></i>
              </Button >
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>

      </form>

    );
  }
}

SearchForm.propTypes = {
};

SearchForm.defaultProps = {
};
