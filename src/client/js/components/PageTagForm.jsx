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
      selected: [],
    };
    this.crowi = this.props.crowi;

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    this.props.handleSubmit(this.state.selected);
  }

  render() {
    return (
      <div className="tag-typeahead">
        <AsyncTypeahead
          allowNew
          caseSensitive={false}
          defaultSelected={this.props.defaultPageTags}
          emptyLabel=""
          isLoading={this.state.isLoading}
          minLength={1}
          multiple
          newSelectionPrefix=""
          // onBlur={this.handleSubmit}
          onChange={(selected) => {
            this.setState({ selected });
          }}
          onSearch={async(query) => {
            this.setState({ isLoading: true });
            const res = await this.crowi.apiGet('/tags.search', { q: query });
            res.tags.unshift(query); // selectable query
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
  defaultPageTags: PropTypes.array,
  handleSubmit: PropTypes.func,
};

PageTagForm.defaultProps = {
};
