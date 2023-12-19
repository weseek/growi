import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { Themes, useNextThemes } from '~/stores/use-next-themes';

import { IconWithTooltip } from './IconWIthTooltip';

export const ColorModeSettings = (): JSX.Element => {
  const { t } = useTranslation();

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
      <h2 className="border-bottom mb-4">{t('ui_settings.color_mode.settings')}</h2>

      <form className="row justify-content-center">

        <div className="col-md-6">

          <div className="d-flex align-items-center mb-3">
            <IconWithTooltip id="iwt-light" label="Light">
              <span className="material-symbols-outlined me-2">light_mode</span>
            </IconWithTooltip>
            <div className="form-check form-switch">
              <input
                id="swUserPreference"
                className="form-check-input"
                type="checkbox"
                checked={isDarkMode}
                disabled={useOsSettings}
                onChange={e => userPreferenceSwitchModifiedHandler(e.target.checked)}
              />
            </div>
            <IconWithTooltip id="iwt-dark" label="Dark">
              <span className="material-symbols-outlined">dark_mode</span>
            </IconWithTooltip>

            <label className="form-label form-check-label ms-2 mt-2" htmlFor="swUserPreference">
              {t('ui_settings.color_mode.description')}
            </label>
          </div>

          <div className="form-check">
            <input
              id="cbFollowOs"
              className="form-check-input"
              type="checkbox"
              checked={useOsSettings}
              onChange={e => followOsCheckboxModifiedHandler(e.target.checked)}
            />
            <label className="form-label form-check-label text-nowrap" htmlFor="cbFollowOs">{t('ui_settings.color_mode.use_os_settings')}</label>
          </div>
        </div>
      </form>
    </>
  );
};
