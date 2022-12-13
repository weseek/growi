import React from 'react';

import { GrowiThemeSchemeType, PresetThemesSummaries } from '@growi/preset-themes';
import { useTranslation } from 'next-i18next';

import { ThemeColorBox } from './ThemeColorBox';

const lightNDarkTheme = PresetThemesSummaries.filter(s => s.schemeType === GrowiThemeSchemeType.BOTH);
const uniqueTheme = PresetThemesSummaries.filter(s => s.schemeType !== GrowiThemeSchemeType.BOTH);


type Props = {
  selectedTheme: string,
  onSelected?: (themeName: string) => void,
};

const CustomizeThemeOptions = (props: Props): JSX.Element => {

  const { selectedTheme, onSelected } = props;

  const { t } = useTranslation('admin');


  return (
    <div id="themeOptions">
      {/* Light and Dark Themes */}
      <div>
        <h3>{t('customize_settings.theme_desc.light_and_dark')}</h3>
        <div className="d-flex flex-wrap">
          {lightNDarkTheme.map((theme) => {
            return (
              <ThemeColorBox
                key={theme.name}
                isSelected={selectedTheme === theme.name}
                onSelected={() => onSelected?.(theme.name)}
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
                isSelected={selectedTheme === theme.name}
                onSelected={() => onSelected?.(theme.name)}
                {...theme}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

};


export default CustomizeThemeOptions;
