import React from 'react';
import PropTypes from 'prop-types';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';


const SearchControl = (props) => {

  return (
    <div className="">
      <div className="search-page-input sps sps--abv">
        <SearchPageForm
          t={props.t}
          keyword={props.searchingKeyword}
          appContainer={props.appContainer}
          onSearchFormChanged={props.onSearchInvoked}
        />
      </div>
      {/* TODO: place deleteAll button , relevance button , include specificPath button */}
    </div>
  );
};

SearchControl.propTypes = {
  t: PropTypes.func.isRequired,
  searchingKeyword:  PropTypes.string.isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  onSearchInvoked: PropTypes.func.isRequired,
};

export default SearchControl;
