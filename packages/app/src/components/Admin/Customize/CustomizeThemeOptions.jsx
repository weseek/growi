import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';


import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { GrowiThemes } from '~/interfaces/theme';

import { withUnstatedContainers } from '../../UnstatedUtils';

import ThemeColorBox from './ThemeColorBox';

/* eslint-disable no-multi-spaces */
const lightNDarkTheme = [{
  name: GrowiThemes.DEFAULT,      bg: '#ffffff', topbar: '#2a2929', sidebar: '#122c55', theme: '#209fd8',
}, {
  name: GrowiThemes.MONO_BLUE,    bg: '#F7FBFD', topbar: '#2a2929', sidebar: '#00587A', theme: '#00587A',
}, {
  name: GrowiThemes.HUFFLEPUFF,   bg: '#EFE2CF', topbar: '#2a2929', sidebar: '#EAAB20', theme: '#993439',
}, {
  name: GrowiThemes.FIRE_RED,     bg: '#FDFDFD', topbar: '#2c2c2c', sidebar: '#BFBFBF', theme: '#EA5532',
}, {
  name: GrowiThemes.JADE_GREEN,   bg: '#FDFDFD', topbar: '#2c2c2c', sidebar: '#BFBFBF', theme: '#38B48B',
}];

const uniqueTheme = [{
  name: GrowiThemes.NATURE,       bg: '#f9fff3', topbar: '#234136', sidebar: '#118050', theme: '#460039',
}, {
  name: GrowiThemes.WOOD,         bg: '#fffefb', topbar: '#2a2929', sidebar: '#aaa45f', theme: '#aaa45f',
}, {
  name: GrowiThemes.ISLAND,       bg: '#cef2ef', topbar: '#2a2929', sidebar: '#0c2a44', theme: 'rgba(183, 226, 219, 1)',
}, {
  name: GrowiThemes.CHRISTMAS,    bg: '#fffefb', topbar: '#b3000c', sidebar: '#30882c', theme: '#d3c665',
}, {
  name: GrowiThemes.ANTARCTIC,    bg: '#ffffff', topbar: '#2a2929', sidebar: '#000080', theme: '#fa9913',
}, {
  name: GrowiThemes.SPRING,       bg: '#ffffff', topbar: '#d3687c', sidebar: '#ffb8c6', theme: '#67a856',
}, {
  name: GrowiThemes.FUTURE,       bg: '#16282d', topbar: '#2a2929', sidebar: '#00b5b7', theme: '#00b5b7',
}, {
  name: GrowiThemes.HALLOWEEN,    bg: '#030003', topbar: '#aa4a04', sidebar: '#162b33', theme: '#e9af2b',
}, {
  name: GrowiThemes.KIBELA,       bg: '#f4f5f6', topbar: '#1256a3', sidebar: '#5882fa', theme: '#b5cbf79c',
}, {
  name: GrowiThemes.BLACKBOARD,   bg: '#223729', topbar: '#563E23', sidebar: '#7B5932', theme: '#DA8506',
}];


const CustomizeThemeOptions = (props) => {

  const { adminCustomizeContainer, currentTheme } = props;
  const { currentLayout } = adminCustomizeContainer.state;

  const { t } = useTranslation('admin');


  return (
    <div id="themeOptions" className={`${currentLayout === 'kibela' && 'disabled'}`}>
      {/* Light and Dark Themes */}
      <div>
        <h3>{t('customize_settings.theme_desc.light_and_dark')}</h3>
        <div className="d-flex flex-wrap">
          {lightNDarkTheme.map((theme) => {
            return (
              <ThemeColorBox
                key={theme.name}
                isSelected={currentTheme === theme.name}
                onSelected={() => props.onSelected(theme.name)}
                {...theme}
              />
            );
          })}
        </div>
      </div>
      {/* Unique Theme */}
      <div className="mt-3">
        <h3>{t('customize_settings.theme_desc.unique')}</h3>
        <div className="d-flex flex-wrap">
          {uniqueTheme.map((theme) => {
            return (
              <ThemeColorBox
                key={theme.name}
                isSelected={currentTheme === theme.name}
                onSelected={() => props.onSelected(theme.name)}
                {...theme}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

};

const CustomizeThemeOptionsWrapper = withUnstatedContainers(CustomizeThemeOptions, [AdminCustomizeContainer]);

CustomizeThemeOptions.propTypes = {
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
  onSelected: PropTypes.func,
  currentTheme: PropTypes.string,
};

export default CustomizeThemeOptionsWrapper;
