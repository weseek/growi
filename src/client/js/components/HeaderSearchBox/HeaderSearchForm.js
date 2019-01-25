import React from 'react';

import FormGroup from 'react-bootstrap/es/FormGroup';
import Button from 'react-bootstrap/es/Button';
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

  onSubmit(query) {
    this.refs.form.submit(query);
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
            <SearchForm
              crowi={this.crowi}
              onSubmit={this.onSubmit}
              placeholder="Search ..."
              keyword=''
            />
            <InputGroup.Button>
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
