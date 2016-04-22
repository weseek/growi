import React from 'react';

import SearchSuggest from './SearchSuggest';

export default class extends React.Component {

  render() {
    return (
      <div className="form-group input-group search-top-input-group">
        <input type="text" id="search-top-input" className="search-top-input form-control" placeholder="Search ..." />
        <span className="input-group-btn">
          <button className="btn btn-default" type="button"><i className="search-top-icon fa fa-search"></i></button>
        </span>
        <SearchSuggest />
      </div>
    );
  }
}
