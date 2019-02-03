import React from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import Button from 'react-bootstrap/es/Button';
import DropdownButton from 'react-bootstrap/es/DropdownButton';
import MenuItem from 'react-bootstrap/es/MenuItem';
import InputGroup from 'react-bootstrap/es/InputGroup';

import SearchForm from './SearchForm';


export default class HeaderSearchBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isScopeChildren: false,
    };

    this.onClickAllPages = this.onClickAllPages.bind(this);
    this.onClickChildren = this.onClickChildren.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  onClickAllPages() {
    this.setState({ isScopeChildren: false });
  }

  onClickChildren() {
    this.setState({ isScopeChildren: true });
  }

  onSubmit() {
    this.refs.form.submit();
  }

  render() {

    const scopeLabel = this.state.isScopeChildren ? 'Children' : 'All pages';

    return (
      <form
        ref='form'
        action='/_search'
        className='search-form form-group input-group search-input-group hidden-print'
      >
        <FormGroup>
          <InputGroup>
          <InputGroup.Button className="btn-group-dropdown-scope">
            <DropdownButton id="dbScope" title={scopeLabel}>
              <MenuItem onClick={this.onClickAllPages}>All pages</MenuItem>
              <MenuItem onClick={this.onClickChildren}>Children</MenuItem>
            </DropdownButton>
          </InputGroup.Button>
            <SearchForm
              crowi={this.props.crowi}
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

HeaderSearchBox.propTypes = {
  crowi: PropTypes.object.isRequired,
};
