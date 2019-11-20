import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class SecurityLocalSetting extends React.Component {

  render() {
    return (
      <h1>hoge</h1>
    );
  }

}

SecurityLocalSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

const SecurityLocalSettingWrapper = (props) => {
  return createSubscribedElement(SecurityLocalSetting, props, [AppContainer]);
};

export default withTranslation()(SecurityLocalSettingWrapper);
