import React from 'react';
import PropTypes from 'prop-types';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class TagsInput
 * @extends {React.Component}
 */

class TagsInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      resultTags: [],
      isLoading: false,
      selected: this.props.tags,
      defaultPageTags: this.props.tags,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    this.typeahead.getInstance().focus();
  }

  handleChange(selected) {
    // send tags to TagLabel Component when user add tag to form everytime
    this.setState({ selected }, () => {
      this.props.onTagsUpdated(this.state.selected);
    });
  }

  async handleSearch(query) {
    this.setState({ isLoading: true });
    const res = await this.props.appContainer.apiGet('/tags.search', { q: query });
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
          id="tag-typeahead-asynctypeahead"
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

/**
 * Wrapper component for using unstated
 */
const TagsInputWrapper = (props) => {
  return createSubscribedElement(TagsInput, props, [AppContainer]);
};

TagsInput.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  tags: PropTypes.array.isRequired,
  onTagsUpdated: PropTypes.func.isRequired,
};

TagsInput.defaultProps = {
};

export default TagsInputWrapper;
