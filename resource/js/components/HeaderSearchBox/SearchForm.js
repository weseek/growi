import React from 'react';

import FormGroup from 'react-bootstrap/es/FormGroup';
import Button from 'react-bootstrap/es/Button';
import InputGroup from 'react-bootstrap/es/InputGroup';

import SearchTypeahead from '../SearchTypeahead';


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

  getHelpElement() {
    return <table className="table table-borderd search-help">
              <caption>Search Help</caption>
              <tbody>
                <tr>
                  <td>keyword</td>
                  <th>記事名 or カテゴリ or 本文にkeywordを含む</th>
                </tr>
                <tr>
                  <td>title:keyword</td>
                  <th>記事名にkeywordを含む</th>
                </tr>
                <tr>
                  <td>a b</td>
                  <th>文字列aとbを含む(スペース区切り)</th>
                </tr>
                <tr>
                  <td>-keyword</td>
                  <th>文字列keywordを含まない</th>
                </tr>
              </tbody>
            </table>;
  }

  render() {
    const emptyLabel = (this.state.searchError !== null)
      ? 'Error on searching.'
      : 'No matches found on title... Hit [Enter] key so that search on contents.';

    return (
      <form
        action="/_search"
        className="search-form form-group input-group search-input-group"
      >
        <FormGroup>
          <InputGroup>
            <SearchTypeahead
              crowi={this.crowi}
              onChange={this.onChange}
              emptyLabel={emptyLabel}
              placeholder="Search ..."
              promptText={this.getHelpElement()}
            />
            <InputGroup.Button>
              <Button type="submit" bsStyle="link">
                <i className="icon-magnifier"></i>
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
