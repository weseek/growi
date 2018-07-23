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
      <SearchTypeahead
        crowi={this.crowi}
        onSearchError={this.onSearchError}
        emptyLabel={emptyLabel}
        placeholder="Input page name"
        keywordOnInit={this.getParentPageName(this.props.parentPageName)}
      />
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
