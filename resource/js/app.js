import React from 'react';
import ReactDOM from 'react-dom';

import SearchBox  from './components/Header/SearchBox';
import SearchPage  from './components/Search/SearchPage';

/*
class Crowi extends React.Component {
  constructor(props) {
    super(props);
    //this.state = {count: props.initialCount};
    //this.tick = this.tick.bind(this);
  }

  render() {
    return (
      <h1>Hello</h1>
    );
  }
}
*/

var componentMappings = {
  'search-top': <SearchBox />,
  'search-page': <SearchPage />,
};

Object.keys(componentMappings).forEach((key) => {
  var elem = document.getElementById(key);
  if (elem) {
    ReactDOM.render(componentMappings[key], elem);
  }
});
