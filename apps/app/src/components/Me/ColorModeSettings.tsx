import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';


import { Themes, useNextThemes } from '~/stores/use-next-themes';

import MoonIcon from '../Icons/MoonIcon';
import SunIcon from '../Icons/SunIcon';


const IconWithTooltip = ({
  id, label, children, additionalClasses,
}) => (
  <>
    <div id={id} className={`px-2 grw-icon-container ${additionalClasses != null ? additionalClasses : ''}`}>{children}</div>
    <UncontrolledTooltip placement="bottom" fade={false} target={id}>{label}</UncontrolledTooltip>
  </>
);

export const ColorModeSettings = (): JSX.Element => {
  const { t } = useTranslation('commons');

  const {
    setTheme, resolvedTheme, useOsSettings, isDarkMode,
  } = useNextThemes();

  const userPreferenceSwitchModifiedHandler = useCallback((isDarkMode: boolean) => {
    setTheme(isDarkMode ? Themes.DARK : Themes.LIGHT);
  }, [setTheme]);

  const followOsCheckboxModifiedHandler = useCallback((isChecked: boolean) => {
    if (isChecked) {
      setTheme(Themes.SYSTEM);
    }
    else {
      setTheme(resolvedTheme ?? Themes.LIGHT);
    }
  }, [resolvedTheme, setTheme]);

  return (
    <>
      <h2 className="border-bottom mb-4">{t('personal_dropdown.color_mode')}</h2>
      <form className="px-4">
        <div className="justify-content-center">
          <div className="col-auto d-flex align-items-center">

            <IconWithTooltip id="iwt-light" label="Light" additionalClasses={useOsSettings ? 'grw-color-mode-icon-muted' : 'grw-color-mode-icon'}>
              <SunIcon />
            </IconWithTooltip>

            <div className="form-check form-switch form-check-secondary ms-2">
              <input
                id="swUserPreference"
                className="form-check-input"
                type="checkbox"
                checked={isDarkMode}
                disabled={useOsSettings}
                onChange={e => userPreferenceSwitchModifiedHandler(e.target.checked)}
              />
              <label className="form-label form-check-label" htmlFor="swUserPreference"></label>
            </div>

            <IconWithTooltip id="iwt-dark" label="Dark" additionalClasses={useOsSettings ? 'grw-color-mode-icon-muted' : 'grw-color-mode-icon'}>
              <MoonIcon />
            </IconWithTooltip>
          </div>
        </div>

        <div>
          <div className="col-auto">
            <div className="form-check">
              <input
                id="cbFollowOs"
                className="form-check-input"
                type="checkbox"
                checked={useOsSettings}
                onChange={e => followOsCheckboxModifiedHandler(e.target.checked)}
              />
              <label className="form-label form-check-label text-nowrap" htmlFor="cbFollowOs">{t('personal_dropdown.use_os_settings')}</label>
            </div>
          </div>
        </div>

      </form>
    </>
  );
};
