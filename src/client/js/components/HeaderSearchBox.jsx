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
      text: '',
      isScopeChildren: false,
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickAllPages = this.onClickAllPages.bind(this);
    this.onClickChildren = this.onClickChildren.bind(this);
    this.search = this.search.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  onInputChange(text) {
    this.setState({ text });
  }

  onClickAllPages() {
    this.setState({ isScopeChildren: false });
  }

  onClickChildren() {
    this.setState({ isScopeChildren: true });
  }

  search() {
    const url = new URL(location.href);
    url.pathname = '/_search';

    // construct search query
    let q = this.state.text;
    if (this.state.isScopeChildren) {
      q += ` prefix:${location.pathname}`;
    }
    url.searchParams.append('q', q);

    location.href = url.href;
  }

  render() {

    const scopeLabel = this.state.isScopeChildren ? 'Children' : 'All pages';

    return (
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
            onInputChange={this.onInputChange}
            onSubmit={this.search}
            placeholder="Search ..."
          />
          <InputGroup.Button className="btn-group-submit-search">
            <Button bsStyle="link" onClick={this.search}>
              <i className="icon-magnifier"></i>
            </Button >
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }
}

HeaderSearchBox.propTypes = {
  crowi: PropTypes.object.isRequired,
};
