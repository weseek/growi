import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from '~/i18n';
import { useSearchServiceReachable } from '~/stores/context';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';

import SearchForm from '../SearchForm';


// eslint-disable-next-line react/prop-types
const GlobalSearchFormGroup = ({ children }) => {
  const { data: isReachable } = useSearchServiceReachable();

  return (
    <div className={`form-group mb-0 d-print-none ${isReachable ? '' : 'has-error'}`}>
      {children}
    </div>
  );
};


class GlobalSearch extends React.Component {

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
    const { t, dropup } = this.props;
    const scopeLabel = this.state.isScopeChildren
      ? t('header_search_box.label.This tree')
      : t('header_search_box.label.All pages');

    return (
      <GlobalSearchFormGroup>
        <div className="input-group flex-nowrap">
          <div className={`input-group-prepend ${dropup ? 'dropup' : ''}`}>
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
            onInputChange={this.onInputChange}
            onSubmit={this.search}
            placeholder="Search ..."
            dropup={dropup}
          />
          <div className="btn-group-submit-search">
            <span className="btn-link text-decoration-none" onClick={this.search}>
              <i className="icon-magnifier"></i>
            </span>
          </div>
        </div>
      </GlobalSearchFormGroup>
    );
  }

}

GlobalSearch.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,

  dropup: PropTypes.bool,
};

/**
 * Wrapper component for using unstated
 */
const GlobalSearchWrapper = withUnstatedContainers(GlobalSearch, [NavigationContainer]);

export default withTranslation()(GlobalSearchWrapper);
