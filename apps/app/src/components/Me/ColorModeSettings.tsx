import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { Themes, useNextThemes } from '~/stores/use-next-themes';

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

      <form className="row justify-content-center">

        <div className="col-md-6">

          <div className="d-flex align-items-center mb-3">
            <span className="material-symbols-outlined me-2">light_mode</span>
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
            <span className="material-symbols-outlined">dark_mode</span>

            <label className="form-label form-check-label ms-2 mt-2" htmlFor="swUserPreference">
              カラーモードを選択する
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
            <label className="form-label form-check-label text-nowrap" htmlFor="cbFollowOs">{t('personal_dropdown.use_os_settings')}</label>
          </div>
        </div>
      </form>
    </>
  );
};
