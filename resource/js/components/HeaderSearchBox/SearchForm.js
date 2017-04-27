import React from 'react';
import { FormGroup, FormControl, DropdownButton, MenuItem, Button, Checkbox, InputGroup } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

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

  render() {
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
              placeholder="Search ... Page Title (Path) and Content"
              submitFormOnEnter={true}
              onSearch={this.search}
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
};
