import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import ThemeColorBox from './ThemeColorBox';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

class CustomizeThemeOptions extends React.Component {

  render() {
    const { adminCustomizeContainer } = this.props;
    const { currentLayout, currentTheme } = adminCustomizeContainer.state;

    const lightTheme = [{
      name: 'default', bg: '#ffffff', topbar: '#334455', theme: '#112744',
    }, {
      name: 'nature', bg: '#f9fff3', topbar: '#118050', theme: '#460039',
    }, {
      name: 'mono-blue', bg: '#F7FBFD', topbar: '#00587A', theme: '#00587A',
    }, {
      name: 'wood', bg: '#fffefb', topbar: '#aaa45f', theme: '#dddebf',
    }, {
      name: 'island', bg: '#8ecac0', topbar: '#0c2a44', theme: '#cef2ef',
    }, {
      name: 'christmas', bg: '#fffefb', topbar: '#b3000c', theme: '#017e20',
    }, {
      name: 'antarctic', bg: '#ffffff', topbar: '#000080', theme: '#99cccc',
    }];

    const darkTheme = [{
      name: 'default-dark', bg: '#212731', topbar: '#151515', theme: '#f75b36',
    }, {
      name: 'future', bg: '#16282D', topbar: '#011414', theme: '#04B4AE',
    }, {
      name: 'blue-night', bg: '#061F2F', topbar: '#27343B', theme: '#0090C8',
    }, {
      name: 'halloween', bg: '#030003', topbar: '#cc5d1f', theme: '#e9af2b',
    }];

    return (
      <div id="themeOptions" className={`${currentLayout === 'kibela' && 'disabled'}`}>
        {/* Light Themes  */}
        <div className="d-flex">
          {lightTheme.map((theme) => {
            return (
              <ThemeColorBox
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
        {/* Dark Themes  */}
        <div className="d-flex mt-3">
          {darkTheme.map((theme) => {
            return (
              <ThemeColorBox
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
    );
  }

}

const CustomizeThemeOptionsWrapper = (props) => {
  return createSubscribedElement(CustomizeThemeOptions, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeThemeOptions.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default CustomizeThemeOptionsWrapper;
