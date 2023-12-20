import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { Themes, useNextThemes } from '~/stores/use-next-themes';

export const ColorModeSettings = (): JSX.Element => {
  const { t } = useTranslation();

  const { setTheme, theme } = useNextThemes();

  const isActive = useCallback((targetTheme: Themes) => {
    return targetTheme === theme;
  }, [theme]);

  return (
    <>
      <h2 className="border-bottom mb-4">{t('color_mode_settings.settings')}</h2>

      <div className="offset-md-3">
        <div className="d-flex">
          <button
            type="button"
            onClick={() => { setTheme(Themes.LIGHT) }}
            // eslint-disable-next-line max-len
            className={`btn py-2 px-4 me-3 d-flex align-items-center justify-content-center ${isActive(Themes.LIGHT) ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
          >
            <span className="material-symbols-outlined fs-5 me-1">light_mode</span>
            <span>{t('color_mode_settings.light')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setTheme(Themes.DARK) }}
            // eslint-disable-next-line max-len
            className={`btn py-2 px-4 me-3 d-flex align-items-center justify-content-center ${isActive(Themes.DARK) ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
          >
            <span className="material-symbols-outlined fs-5 me-1">dark_mode</span>
            <span>{t('color_mode_settings.dark')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setTheme(Themes.SYSTEM) }}
            // eslint-disable-next-line max-len
            className={`btn py-2 px-4 d-flex align-items-center justify-content-center ${isActive(Themes.SYSTEM) ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
          >
            <span className="material-symbols-outlined fs-5 me-1">devices</span>
            <span>{t('color_mode_settings.system')}</span>
          </button>
        </div>

        <div className="mt-3 text-muted">
          {/* eslint-disable-next-line react/no-danger */}
          <span dangerouslySetInnerHTML={{ __html: t('color_mode_settings.description') }} />
        </div>
      </div>
    </>
  );
};
