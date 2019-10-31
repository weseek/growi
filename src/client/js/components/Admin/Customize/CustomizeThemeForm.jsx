import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';


class CustomizeThemeForm extends React.Component {

  render() {
    return (
      <div id="themeOptions">
        {/* Light Themes  */}
        <div className="d-flex">

        </div>
        {/* Dark Themes  */}
        <div className="d-flex mt-3">

        </div>
      </div>
    );
  }

}
const CustomizeThemeFormWrapper = (props) => {
  return createSubscribedElement(CustomizeThemeForm, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeThemeForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeThemeFormWrapper);
