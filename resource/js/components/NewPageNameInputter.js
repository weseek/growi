import React from 'react';
import { FormGroup } from 'react-bootstrap/es/FormGroup';
import { Button } from 'react-bootstrap/es/Button';
import { InputGroup } from 'react-bootstrap/es/InputGroup';

import UserPicture from './User/UserPicture';
import PageListMeta from './PageList/PageListMeta';
import PagePath from './PageList/PagePath';
import PropTypes from 'prop-types';
import SearchTypeahead from './SearchTypeahead';

export default class NewPageNameInputter extends React.Component {

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

NewPageNameInputter.propTypes = {
  crowi:          PropTypes.object.isRequired,
  parentPageName: PropTypes.string,
};

NewPageNameInputter.defaultProps = {
  parentPageName: '',
};
