import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import SearchForm from '../SearchForm';


class SearchTop extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      isScopeChildren: false,
      isCollapsed: true,
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickAllPages = this.onClickAllPages.bind(this);
    this.onClickChildren = this.onClickChildren.bind(this);
    this.search = this.search.bind(this);
  }

  componentWillMount() {
    this.initBreakpointEvents();
  }

  initBreakpointEvents() {
    this.props.appContainer.addBreakpointListener('md', (mql) => {
      this.setState({ isCollapsed: !mql.matches });
    }, true);
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

  Root = ({ children }) => {
    const { isCollapsed } = this.state;

    return isCollapsed
      ? (
        <div id="grw-search-top-collapse" className="collapse bg-dark p-3">
          {children}
        </div>
      )
      : (
        <div className="grw-search-top-fixed position-fixed">
          {children}
        </div>
      );
  };

  SearchTopForm = () => {
    const { t, appContainer } = this.props;
    const scopeLabel = this.state.isScopeChildren
      ? t('header_search_box.label.This tree')
      : t('header_search_box.label.All pages');

    const config = appContainer.getConfig();
    const isReachable = config.isSearchServiceReachable;

    return (
      <div className={`form-group mb-0 ${isReachable ? '' : 'has-error'}`}>
        <div className="input-group flex-nowrap">
          <div className="input-group-prepend">
            <button className="btn btn-secondary dropdown-toggle py-0" type="button" data-toggle="dropdown" aria-haspopup="true">
              {scopeLabel}
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" type="button" onClick={this.onClickAllPages}>{ t('header_search_box.item_label.All pages') }</button>
              <button className="dropdown-item" type="button" onClick={this.onClickChildren}>{ t('header_search_box.item_label.This tree') }</button>
            </div>
          </div>
          <SearchForm
            t={this.props.t}
            crowi={this.props.appContainer}
            onInputChange={this.onInputChange}
            onSubmit={this.search}
            placeholder="Search ..."
          />
          <div className="btn-group-submit-search">
            <span className="btn-link text-decoration-none" onClick={this.search}>
              <i className="icon-magnifier"></i>
            </span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { Root, SearchTopForm } = this;
    return (
      <Root><SearchTopForm /></Root>
    );
  }

}

SearchTop.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SearchTopWrapper = (props) => {
  return createSubscribedElement(SearchTop, props, [AppContainer]);
};

export default withTranslation()(SearchTopWrapper);
