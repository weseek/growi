import React from 'react';
import ReactDOM from 'react-dom';

import HeaderSearchBox  from './components/HeaderSearchBox';
import SearchPage  from './components/SearchPage';

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
  'search-top': <HeaderSearchBox />,
  'search-page': <SearchPage />,
};

Object.keys(componentMappings).forEach((key) => {
  var elem = document.getElementById(key);
  if (elem) {
    ReactDOM.render(componentMappings[key], elem);
  }
});
