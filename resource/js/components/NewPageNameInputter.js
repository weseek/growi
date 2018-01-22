// This is the root component for #search-top

import React from 'react';
import { FormGroup, Button, InputGroup } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import SearchForm from './HeaderSearchBox/SearchForm';
// import SearchSuggest from './HeaderSearchBox/SearchSuggest'; // omit since using react-bootstrap-typeahead in SearchForm

import PagePath from './PageList/PagePath';

import PropTypes from 'prop-types';

export default class NewPageNameInputter extends SearchForm {

  constructor(props) {
    super(props);

    this.state.keyword = props.keyword
  }

  render() {
    const emptyLabel = (this.state.searchError !== null)
        ? 'Error on searching.'
        : 'No matches found on title...';
    const formClear = this.getFormClearComponent();
    const keyword = "hoge";

    return (
      <form
        action="/_search"
        className=""
      >
        <AsyncTypeahead
            ref={ref => this._typeahead = ref}
            inputProps={{name: "q", autoComplete: "off"}}
            isLoading={this.state.isLoading}
            labelKey="path"
            minLength={2}
            options={this.state.pages}
            placeholder="Input page name"
            emptyLabel={emptyLabel}
            align='left'
            submitFormOnEnter={true}
            onSearch={this.search}
            onInputChange={this.onInputChange}
            renderMenuItemChildren={this.renderMenuItemChildren}
            caseSensitive={false}
            keyword={keyword} // 検索キーワードを表示中のページの親ページにしたいがやり方不明。[TODO]
        />
        {formClear}
        <span>page: {this.state.keyword}</span> {/* 検索キーワードを表示デバッグ用 */ }

      </form>

    );
  }
}

NewPageNameInputter.propTypes = {
  keyword: PropTypes.string.isRequired,
};
NewPageNameInputter.defaultProps = {
  keyword: "",
};
