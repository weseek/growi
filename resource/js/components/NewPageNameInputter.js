import React from 'react';
import { FormGroup, Button, InputGroup } from 'react-bootstrap';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import UserPicture from './User/UserPicture';
import PageListMeta from './PageList/PageListMeta';
import PagePath from './PageList/PagePath';
import PropTypes from 'prop-types';
import SearchTypeahead from './SearchTypeahead';

export default class NewPageNameInputter extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      input: '',
      keyword: '',
      isLoading: false,
      searchError: null,
    };
    this.crowi = this.props.crowi;

    this.onSearchSuccess = this.onSearchSuccess.bind(this);
    this.onSearchError = this.onSearchError.bind(this);
    this.getParentPageName = this.getParentPageName.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  onSearchSuccess(res) {
    this.setState({
      isLoading: false,
      keyword: '',
      pages: res.data,
    });
  }

  onSearchError(err) {
    this.setState({
      isLoading: false,
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
        onSearchSuccess={this.onSearchSuccess}
        onSearchError={this.onSearchError}
        emptyLabel={emptyLabel}
        keywordOnInit={this.getParentPageName(this.props.parentPageName)}
      />
    );
  }
}

NewPageNameInputter.propTypes = {
  crowi:          PropTypes.object.isRequired,
  parentPageName: PropTypes.string.isRequired,
};

NewPageNameInputter.defaultProps = {
};
