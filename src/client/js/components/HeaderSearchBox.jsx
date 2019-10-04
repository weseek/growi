import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  Button,
  InputGroup, InputGroupButtonDropdown, InputGroupAddon,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import SearchForm from './SearchForm';


class HeaderSearchBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      text: '',
      isScopeChildren: false,
    };

    this.toggle = this.toggle.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onClickAllPages = this.onClickAllPages.bind(this);
    this.onClickChildren = this.onClickChildren.bind(this);
    this.search = this.search.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  toggle() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
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
      <>
        <InputGroup className="flex-nowrap">
          <InputGroupButtonDropdown addonType="append" isOpen={this.state.dropdownOpen} toggle={this.toggle} className="btn-group-dropdown-scope">
            <DropdownToggle caret>{scopeLabel}</DropdownToggle>
            <DropdownMenu className="pl-3 py-0" title={scopeLabel}>
              <DropdownItem onClick={this.onClickAllPages}>All pages</DropdownItem>
              <DropdownItem onClick={this.onClickChildren}>{ t('header_search_box.item_label.This tree') }</DropdownItem>
            </DropdownMenu>
          </InputGroupButtonDropdown>
          <SearchForm
            t={this.props.t}
            crowi={this.props.crowi}
            onInputChange={this.onInputChange}
            onSubmit={this.search}
            placeholder="Search ..."
          />
          <InputGroupAddon addonType="append" className="btn-group-submit-search">
            <Button color="link" onClick={this.search}>
              <i className="icon-magnifier"></i>
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </>
    );
  }

}

HeaderSearchBox.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
};

export default withTranslation()(HeaderSearchBox);
