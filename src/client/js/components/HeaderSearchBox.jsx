import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import Button from 'react-bootstrap/es/Button';
import DropdownButton from 'react-bootstrap/es/DropdownButton';
import MenuItem from 'react-bootstrap/es/MenuItem';
import InputGroup from 'react-bootstrap/es/InputGroup';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

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
    const { t, appContainer } = this.props;
    const scopeLabel = this.state.isScopeChildren
      ? t('header_search_box.label.This tree')
      : 'All pages';

    const config = appContainer.getConfig();
    const isReachable = config.isSearchServiceReachable;

    return (
      <FormGroup className={isReachable ? '' : 'has-error'}>
        <InputGroup>
          <InputGroup.Button className="btn-group-dropdown-scope">
            <DropdownButton id="dbScope" title={scopeLabel}>
              <MenuItem onClick={this.onClickAllPages}>All pages</MenuItem>
              <MenuItem onClick={this.onClickChildren}>{ t('header_search_box.item_label.This tree') }</MenuItem>
            </DropdownButton>
          </InputGroup.Button>
          <SearchForm
            t={this.props.t}
            crowi={this.props.appContainer}
            onInputChange={this.onInputChange}
            onSubmit={this.search}
            placeholder="Search ..."
          />
          <InputGroup.Button className="btn-group-submit-search">
            <Button bsStyle="link" onClick={this.search}>
              <i className="icon-magnifier"></i>
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }

}


/**
 * Wrapper component for using unstated
 */
const HeaderSearchBoxWrapper = (props) => {
  return createSubscribedElement(HeaderSearchBox, props, [AppContainer]);
};

HeaderSearchBox.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(HeaderSearchBoxWrapper);
