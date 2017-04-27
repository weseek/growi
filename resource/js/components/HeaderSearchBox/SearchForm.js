import React from 'react';
import { FormGroup, Button, InputGroup } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import UserPicture from '../User/UserPicture';
import PageListMeta from '../PageList/PageListMeta';
import PagePath from '../PageList/PagePath';

// Header.SearchForm
export default class SearchForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
      searchedKeyword: '',
    };

    this.search = this.search.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.getFormClearComponent = this.getFormClearComponent.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  search(keyword) {
    this.setState({keyword});

    if (this.state.searchedKeyword != keyword) {
      this.props.onSearchFormChanged({keyword});
      this.setState({searchedKeyword: keyword});
    }
  }

  getFormClearComponent() {
    let isHidden = (this.state.keyword.length === 0);

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
    const options = this.props.searchedPages;

    const emptyLabel = (this.props.searchError !== null) ? 'Error on searching.' : 'No matches found.';
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
              options={options}
              placeholder="Search ... Page Title (Path) and Content"
              emptyLabel={emptyLabel}
              submitFormOnEnter={true}
              onSearch={this.search}
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
  onSearchFormChanged: React.PropTypes.func.isRequired,
  searchedPages: React.PropTypes.array.isRequired,
};

SearchForm.defaultProps = {
  searchError: null
};
