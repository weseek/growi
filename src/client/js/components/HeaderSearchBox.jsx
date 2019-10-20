import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

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
      <div className="form-group">
        <div className="input-group flex-nowrap">
          <div className="input-group-prepend">
            <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true">
              {scopeLabel}
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" type="button" onClick={this.onClickAllPages}>All pages</button>
              <button className="dropdown-item" type="button" onClick={this.onClickChildren}>{ t('header_search_box.item_label.This tree') }</button>
            </div>
          </div>
          <SearchForm
            t={this.props.t}
            crowi={this.props.crowi}
            onInputChange={this.onInputChange}
            onSubmit={this.search}
            placeholder="Search ..."
          />
          <div className="btn-group-submit-search">
            <span className="btn-link" onClick={this.search}>
              <i className="icon-magnifier"></i>
            </span>
          </div>
        </div>
      </div>
    );
  }

}

HeaderSearchBox.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
};

export default withTranslation()(HeaderSearchBox);
