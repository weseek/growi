import React from 'react';
import ReactDOM from 'react-dom';

import HeaderSearchBox from './components/Header/SearchBox';

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

var xxx = document.getElementById('xxx');
if (xxx) {
  $(function() {
    ReactDOM.render(<Crowi />, xxx);
  });
}
