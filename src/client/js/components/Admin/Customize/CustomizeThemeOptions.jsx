import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import ThemeColorBox from './ThemeColorBox';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

class CustomizeThemeOptions extends React.Component {

  render() {
    const { t, adminCustomizeContainer } = this.props;
    const { currentLayout, currentTheme } = adminCustomizeContainer.state;

    const lightNDarkTheme = [{
      name: 'default', bg: '#ffffff', topbar: '#334455', theme: '#112744',
    }, {
      name: 'mono-blue', bg: '#F7FBFD', topbar: '#00587A', theme: '#00587A',
    }];

    const uniqueTheme = [{
      name: 'nature', bg: '#f9fff3', topbar: '#118050', theme: '#460039',
    }, {
      name: 'wood', bg: '#fffefb', topbar: '#aaa45f', theme: '#dddebf',
    }, {
      name: 'island', bg: '#8ecac0', topbar: '#0c2a44', theme: '#cef2ef',
    }, {
      name: 'christmas', bg: '#fffefb', topbar: '#b3000c', theme: '#017e20',
    }, {
      name: 'antarctic', bg: '#ffffff', topbar: '#000080', theme: '#99cccc',
    }, {
      name: 'spring', bg: '#fff5ee', topbar: '#ff69b4', theme: '#ffb6c1',
    }, {
      name: 'future', bg: '#16282D', topbar: '#011414', theme: '#04B4AE',
    }, {
      name: 'halloween', bg: '#030003', topbar: '#cc5d1f', theme: '#e9af2b',
    }];

    return (
      <div id="themeOptions" className={`${currentLayout === 'kibela' && 'disabled'}`}>
        {/* Light and Dark Themes */}
        <div>
          <h3>{t('admin:customize_setting.theme_desc.light_and_dark')}</h3>
          <div className="d-flex flex-wrap">
            {lightNDarkTheme.map((theme) => {
              return (
                <ThemeColorBox
                  key={theme.name}
                  isSelected={currentTheme === theme.name}
                  onSelected={() => adminCustomizeContainer.switchThemeType(theme.name)}
                  name={theme.name}
                  bg={theme.bg}
                  topbar={theme.topbar}
                  theme={theme.theme}
                />
              );
            })}
          </div>
        </div>
        {/* Unique Theme */}
        <div>
          <h3>{t('admin:customize_setting.theme_desc.unique')}</h3>
          <div className="d-flex flex-wrap">
            {uniqueTheme.map((theme) => {
              return (
                <ThemeColorBox
                  key={theme.name}
                  isSelected={currentTheme === theme.name}
                  onSelected={() => adminCustomizeContainer.switchThemeType(theme.name)}
                  name={theme.name}
                  bg={theme.bg}
                  topbar={theme.topbar}
                  theme={theme.theme}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

}

const CustomizeThemeOptionsWrapper = (props) => {
  return createSubscribedElement(CustomizeThemeOptions, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeThemeOptions.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeThemeOptionsWrapper);
