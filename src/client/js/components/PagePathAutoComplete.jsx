import React from 'react';
import PropTypes from 'prop-types';

import { pathUtils } from 'growi-commons';

import SearchTypeahead from './SearchTypeahead';

export default class PagePathAutoComplete extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
    };

    this.crowi = this.props.crowi;

    this.onSubmit = this.onSubmit.bind(this);
    this.getKeywordOnInit = this.getKeywordOnInit.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  onSubmit(query) {
    // get the closest form element
    const elem = this.rootDom;
    const form = elem.closest('form');
    // submit with jQuery
    $(form).submit();
  }

  getKeywordOnInit(path) {
    return this.props.addTrailingSlash
      ? pathUtils.addTrailingSlash(path)
      : pathUtils.removeTrailingSlash(path);
  }

  render() {
    return (
      <div ref={(c) => { this.rootDom = c }}>
        <SearchTypeahead
          ref={this.searchTypeaheadDom}
          crowi={this.crowi}
          onSubmit={this.onSubmit}
          inputName="new_path"
          emptyLabelExceptError={null}
          placeholder="Input page path"
          keywordOnInit={this.getKeywordOnInit(this.props.initializedPath)}
        />
      </div>
    );
  }

}

PagePathAutoComplete.propTypes = {
  crowi:            PropTypes.object.isRequired,
  initializedPath:  PropTypes.string,
  addTrailingSlash: PropTypes.bool,
};

PagePathAutoComplete.defaultProps = {
  initializedPath: '/',
};
