import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import DropdownButton from 'react-bootstrap/es/DropdownButton';
import MenuItem from 'react-bootstrap/es/MenuItem';
import InputGroup from 'react-bootstrap/es/InputGroup';

import {
  Button,
} from 'reactstrap';

import SearchForm from './SearchForm';


class HeaderSearchBox extends React.Component {

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
    const url = new URL(window.location.href);
    url.pathname = '/_search';

    // construct search query
    let q = this.state.text;
    if (this.state.isScopeChildren) {
      q += ` prefix:${window.location.pathname}`;
    }
    url.searchParams.append('q', q);

    window.location.href = url.href;
  }

  render() {
    const t = this.props.t;
    const scopeLabel = this.state.isScopeChildren
      ? t('header_search_box.label.This tree')
      : 'All pages';

    return (
      <FormGroup>
        <InputGroup className="flex-nowrap">
          <InputGroup.Button className="btn-group-dropdown-scope" data-toggle="dropdown">
            <DropdownButton id="dbScope" className="pl-3 py-0" title={scopeLabel}>
              <MenuItem onClick={this.onClickAllPages}>All pages</MenuItem>
              <MenuItem onClick={this.onClickChildren}>{ t('header_search_box.item_label.This tree') }</MenuItem>
            </DropdownButton>
          </InputGroup.Button>
          <SearchForm
            t={this.props.t}
            crowi={this.props.crowi}
            onInputChange={this.onInputChange}
            onSubmit={this.search}
            placeholder="Search ..."
          />
          <InputGroup.Button className="btn-group-submit-search">
            <Button color="link" onClick={this.search}>
              <i className="icon-magnifier"></i>
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }

}

HeaderSearchBox.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
};

export default withTranslation()(HeaderSearchBox);
