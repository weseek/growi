import React from 'react';
import FormGroup from 'react-bootstrap/es/FormGroup';
import Button from 'react-bootstrap/es/Button';
import InputGroup from 'react-bootstrap/es/InputGroup';

import SearchTypeahead from '../SearchTypeahead';

import UserPicture from '../User/UserPicture';
import PageListMeta from '../PageList/PageListMeta';
import PagePath from '../PageList/PagePath';
import PropTypes from 'prop-types';

// Header.SearchForm
export default class SearchForm extends React.Component {

  constructor(props) {
    super(props);

    this.crowi = window.crowi; // FIXME

    this.state = {
      searchError: null,
    };

    this.onSearchError = this.onSearchError.bind(this);
    this.onChange = this.onChange.bind(this);
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

  onChange(selected) {
    const page = selected[0];  // should be single page selected

    // navigate to page
    if (page != null) {
      window.location = page.path;
    }
  }

  render() {
    const emptyLabel = (this.state.searchError !== null)
        ? 'Error on searching.'
        : 'No matches found on title... Hit [Enter] key so that search on contents.';

    return (
      <form
        action="/_search"
        className="search-form form-group input-group search-top-input-group"
      >
        <FormGroup>
          <InputGroup>
            <SearchTypeahead
              crowi={this.crowi}
              onChange={this.onChange}
              emptyLabel={emptyLabel}
              placeholder="Search ..."
            />
            <InputGroup.Button>
              <Button type="submit">
                <i className="search-top-icon fa fa-search"></i>
              </Button >
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>

      </form>

    );
  }
}

SearchForm.propTypes = {
};

SearchForm.defaultProps = {
};
