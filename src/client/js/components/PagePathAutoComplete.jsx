import React from 'react';
import PropTypes from 'prop-types';

import * as pagePathUtils from '@commons/util/page-path-utils';
import SearchTypeahead from './SearchTypeahead';

export default class PagePathAutoComplete extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      searchError: null,
    };
    this.crowi = this.props.crowi;

    this.onSearchError = this.onSearchError.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.getKeywordOnInit = this.getKeywordOnInit.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  onSearchError(err) {
    this.setState({
      searchError: err,
    });
  }

  onSubmit(query) {
    // get the closest form element
    const elem = this.refs.rootDom;
    const form = elem.closest('form');
    // submit with jQuery
    $(form).submit();
  }

  getKeywordOnInit(path) {
    return this.props.addSlashToTheEnd
      ? pagePathUtils.addSlashToTheEnd(path)
      : pagePathUtils.removeLastSlash(path);
  }

  render() {
    const emptyLabel = (this.state.searchError !== null)
      ? 'Error on searching.'
      : 'No matches found on title...';

    return (
      <div ref='rootDom'>
        <SearchTypeahead
          ref={this.searchTypeaheadDom}
          crowi={this.crowi}
          onSearchError={this.onSearchError}
          onSubmit={this.onSubmit}
          inputName='new_path'
          emptyLabel={null}
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
  addSlashToTheEnd: PropTypes.bool,
};

PagePathAutoComplete.defaultProps = {
  initializedPath: '/',
};
