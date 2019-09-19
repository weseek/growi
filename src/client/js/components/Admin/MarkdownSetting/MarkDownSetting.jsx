import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class MarkdownSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }


  render() {
    return <a>hogehoge</a>;
  }

}

const MarkdownSettingWrapper = (props) => {
  return createSubscribedElement(MarkdownSetting, props, [AppContainer]);
};

MarkdownSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

};

export default withTranslation()(MarkdownSettingWrapper);
