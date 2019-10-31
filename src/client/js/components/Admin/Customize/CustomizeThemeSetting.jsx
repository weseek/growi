import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';


class CustomizeThemeSetting extends React.Component {

  render() {
    return (
      <p>hogehoge</p>
    );
  }

}
const CustomizeThemeSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeThemeSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeThemeSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeThemeSettingWrapper);
