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
    };
    this.crowi = this.props.crowi;
  }

  render() {
    return (
      <div className="tag-typeahead">
        <AsyncTypeahead
          id="async-typeahead"
          caseSensitive={false}
          defaultSelected={this.props.currentPageTags}
          isLoading={this.state.isLoading}
          minLength={1}
          multiple
          newSelectionPrefix=""
          onChange={(list) => { // list is a list of object about value. an element have customOption, id and label properties
            this.setState({ selected: list.map((obj) => { return obj.label }) }, () => {
              this.props.addNewTag(this.state.selected);
            });
          }}
          onSearch={async(query) => {
            this.setState({ isLoading: true });
            const res = await this.crowi.apiGet('/tags.search', { q: query });
            res.tags.unshift(query); // selectable new tag whose name equals query
            this.setState({
              resultTags: Array.from(new Set(res.tags)), // use Set for de-duplication
              isLoading: false,
            });
          }}
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
