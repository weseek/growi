import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../UnstatedUtils';
import WebsocketContainer from '../../services/WebsocketContainer';

class MarkdownSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hoge:0
    };
  }


  render() {
    return <a>hogehoge</a>;
  }

}
