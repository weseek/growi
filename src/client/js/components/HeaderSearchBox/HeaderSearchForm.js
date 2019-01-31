import React from 'react';

import FormGroup from 'react-bootstrap/es/FormGroup';
import Button from 'react-bootstrap/es/Button';
import DropdownButton from 'react-bootstrap/es/DropdownButton';
import MenuItem from 'react-bootstrap/es/MenuItem';
import InputGroup from 'react-bootstrap/es/InputGroup';

import SearchForm from '../SearchForm';


// Header.SearchForm
export default class HeaderSearchForm extends React.Component {

  constructor(props) {
    super(props);

    this.crowi = window.crowi; // FIXME

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  onSubmit() {
    this.refs.form.submit();
  }

  render() {
    return (
      <form
        ref='form'
        action='/_search'
        className='search-form form-group input-group search-input-group hidden-print'
      >
        <FormGroup>
          <InputGroup>
          <InputGroup.Button className="btn-group-dropdown-scope">
            <DropdownButton id="dbScope" title="All pages">
              <MenuItem href="#">All pages</MenuItem>
              <MenuItem href="#">Under this page</MenuItem>
            </DropdownButton>
          </InputGroup.Button>
            <SearchForm
              crowi={this.crowi}
              onSubmit={this.onSubmit}
              placeholder="Search ..."
            />
            <InputGroup.Button className="btn-group-submit-search">
              <Button type="submit" bsStyle="link">
                <i className="icon-magnifier"></i>
              </Button >
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>

      </form>

    );
  }
}

HeaderSearchForm.propTypes = {
};

HeaderSearchForm.defaultProps = {
};
