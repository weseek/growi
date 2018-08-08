import React from 'react';
import PropTypes from 'prop-types';

import SearchTypeahead from './SearchTypeahead';

export default class NewPageNameInput extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      searchError: null,
    };
    this.crowi = this.props.crowi;

    this.onSearchError = this.onSearchError.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.getParentPageName = this.getParentPageName.bind(this);
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

  getParentPageName(path) {
    if (path == '/') {
      return path;
    }

    if (path.match(/.+\/$/)) {
      return path;
    }

    return path + '/';
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
          emptyLabel={emptyLabel}
          placeholder="Input page name"
          keywordOnInit={this.getParentPageName(this.props.parentPageName)}
        />
      </div>
    );
  }
}

NewPageNameInput.propTypes = {
  crowi:          PropTypes.object.isRequired,
  parentPageName: PropTypes.string,
};

NewPageNameInput.defaultProps = {
  parentPageName: '',
};
