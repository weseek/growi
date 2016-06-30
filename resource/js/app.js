import React from 'react';
import ReactDOM from 'react-dom';

import HeaderSearchBox  from './components/HeaderSearchBox';
import SearchPage  from './components/SearchPage';
//import ListPageSearch  from './components/ListPageSearch';

const componentMappings = {
  'search-top': <HeaderSearchBox />,
  'search-page': <SearchPage />,
};

Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    ReactDOM.render(componentMappings[key], elem);
  }
});


