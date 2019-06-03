import React from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import Button from 'react-bootstrap/es/Button';
import InputGroup from 'react-bootstrap/es/InputGroup';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import SearchForm from '../SearchForm';

// Search.SearchForm
class SearchPageForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: this.props.keyword,
      searchedKeyword: this.props.keyword,
    };

    this.search = this.search.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  search() {
    const keyword = this.state.keyword;
    this.props.onSearchFormChanged({ keyword });
    this.setState({ searchedKeyword: keyword });
  }

  onInputChange(input) { // for only submitting with button
    this.setState({ keyword: input });
  }

  render() {
    return (
      <FormGroup>
        <InputGroup>
          <SearchForm
            t={this.props.t}
            onSubmit={this.search}
            keyword={this.state.searchedKeyword}
            onInputChange={this.onInputChange}
          />
          <InputGroup.Button className="">
            <Button onClick={this.search}>
              <i className="icon-magnifier"></i>
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SearchPageFormWrapper = (props) => {
  return createSubscribedElement(SearchPageForm, props, [AppContainer]);
};

SearchPageForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  keyword: PropTypes.string,
  onSearchFormChanged: PropTypes.func.isRequired,
};
SearchPageForm.defaultProps = {
};

export default SearchPageFormWrapper;
