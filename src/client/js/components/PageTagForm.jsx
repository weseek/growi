import React from 'react';
import PropTypes from 'prop-types';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class PageTagForm
 * @extends {React.Component}
 */

export default class PageTagForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      resultTags: [],
      isLoading: false,
      selected: this.props.currentPageTags,
      defaultPageTags: this.props.currentPageTags,
    };
    this.crowi = this.props.crowi;

    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleChange(selected) {
    // list is a list of object about value. an element have customOption, id and label properties
    this.setState({ selected }, () => {
      this.props.addNewTag(this.state.selected);
    });
  }

  async handleSearch(query) {
    this.setState({ isLoading: true });
    const res = await this.crowi.apiGet('/tags.search', { q: query });
    res.tags.unshift(query); // selectable new tag whose name equals query
    this.setState({
      resultTags: Array.from(new Set(res.tags)), // use Set for de-duplication
      isLoading: false,
    });
  }

  handleSelect(e) {
    if (e.keyCode === 32) { // '32' means ASCII code of 'space'
      e.preventDefault();
      const instance = this.typeahead.getInstance();
      const { initialItem } = instance.state;

      if (initialItem) {
        instance._handleMenuItemSelect(initialItem, e);
      }
    }
  }

  render() {
    return (
      <div className="tag-typeahead">
        <AsyncTypeahead
          id="async-typeahead"
          ref={(typeahead) => { this.typeahead = typeahead }}
          caseSensitive={false}
          defaultSelected={this.state.defaultPageTags}
          isLoading={this.state.isLoading}
          minLength={1}
          multiple
          newSelectionPrefix=""
          onChange={this.handleChange}
          onSearch={this.handleSearch}
          onKeyDown={this.handleSelect}
          options={this.state.resultTags} // Search result (Some tag names)
          placeholder="tag name"
          selectHintOnEnter
        />
      </div>
    );
  }

}

PageTagForm.propTypes = {
  crowi: PropTypes.object.isRequired,
  currentPageTags: PropTypes.array.isRequired,
  addNewTag: PropTypes.func.isRequired,
};

PageTagForm.defaultProps = {
};
