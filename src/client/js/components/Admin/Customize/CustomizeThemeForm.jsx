import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import ThemeColorBox from './ThemeColorBox';


class CustomizeThemeForm extends React.Component {

  render() {
    return (
      <div id="themeOptions">
        {/* Light Themes  */}
        <div className="d-flex">
          <ThemeColorBox name="default" bg="#ffffff" topbar="#334455" theme="#112744" />
          <ThemeColorBox name="nature" bg="#f9fff3" topbar="#118050" theme="#460039" />
          <ThemeColorBox name="mono-blue" bg="#F7FBFD" topbar="#00587A" theme="#00587A" />
          <ThemeColorBox name="wood" bg="#fffefb" topbar="#aaa45f" theme="#dddebf" />
          <ThemeColorBox name="island" bg="#8ecac0" topbar="#0c2a44" theme="#cef2ef" />
          <ThemeColorBox name="christmas" bg="#fffefb" topbar="#b3000c" theme="#017e20" />
          <ThemeColorBox name="antarctic" bg="#ffffff" topbar="#000080" theme="#99cccc" />
        </div>
        {/* Dark Themes  */}
        <div className="d-flex mt-3">
          <ThemeColorBox name="default-dark" bg="#212731" topbar="#151515" theme="#f75b36" />
          <ThemeColorBox name="future" bg="#16282D" topbar="#011414" theme="#04B4AE" />
          <ThemeColorBox name="blue-night" bg="#061F2F" topbar="#27343B" theme="#0090C8" />
          <ThemeColorBox name="halloween" bg="#030003" topbar="#cc5d1f" theme="#e9af2b" />
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
