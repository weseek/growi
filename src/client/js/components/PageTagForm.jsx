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
          allowNew={true}
          caseSensitive={false}
          defaultSelected={this.props.pageTags}
          emptyLabel={''}
          isLoading={this.state.isLoading}
          labelKey="name"
          minLength={1}
          multiple={true}
          newSelectionPrefix=""
          onBlur={this.handleSubmit}
          onChange={(selected) => {
            this.setState({ selected });
          }}
          onSearch={query => {
            this.setState({ isLoading: true });
            this.crowi.apiGet('/searchTag', { q: query })
              .then(res => {
                this.setState({
                  resultTags: Array.from(new Set([res.data, query])), // use Set for de-duplication
                  isLoading: false,
                });
              });
          }}
          options={this.state.resultTags} // Search result (Some tag names)
          placeholder="tag name"
        />
      </div>
    );
  }
}

PageTagForm.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageTags: PropTypes.array,
  handleSubmit: PropTypes.func,
};

PageTagForm.defaultProps = {
};
