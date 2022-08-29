import React, {
  FC, useCallback, useRef,
} from 'react';

import { useTranslation } from 'next-i18next';
import { useRipple } from 'react-use-ripple';
import { UncontrolledTooltip } from 'reactstrap';

import { useUserUISettings } from '~/client/services/user-ui-settings';
import { usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser } from '~/stores/ui';
import { Themes, useNextThemes } from '~/stores/use-next-themes';

import MoonIcon from '../Icons/MoonIcon';
import SidebarDockIcon from '../Icons/SidebarDockIcon';
import SidebarDrawerIcon from '../Icons/SidebarDrawerIcon';
import SunIcon from '../Icons/SunIcon';

type AppearanceModeDropdownProps = {
  isAuthenticated: boolean,
}
export const AppearanceModeDropdown:FC<AppearanceModeDropdownProps> = (props: AppearanceModeDropdownProps) => {

  const { t } = useTranslation();

  const { isAuthenticated } = props;

  const {
    setTheme, resolvedTheme, useOsSettings, isDarkMode,
  } = useNextThemes();
  const { data: isPreferDrawerMode, update: updatePreferDrawerMode } = usePreferDrawerModeByUser();
  const { data: isPreferDrawerModeOnEdit, mutate: mutatePreferDrawerModeOnEdit } = usePreferDrawerModeOnEditByUser();
  const { scheduleToPut } = useUserUISettings();

  // ripple
  const buttonRef = useRef(null);
  useRipple(buttonRef, { rippleColor: 'rgba(255, 255, 255, 0.3)' });

  const preferDrawerModeSwitchModifiedHandler = useCallback((preferDrawerMode: boolean, isEditMode: boolean) => {
    if (isEditMode) {
      mutatePreferDrawerModeOnEdit(preferDrawerMode);
      scheduleToPut({ preferDrawerModeOnEditByUser: preferDrawerMode });
    }
    else {
      updatePreferDrawerMode(preferDrawerMode);
    }
  }, [updatePreferDrawerMode, mutatePreferDrawerModeOnEdit, scheduleToPut]);

  const followOsCheckboxModifiedHandler = useCallback((isChecked: boolean) => {
    if (isChecked) {
      setTheme(Themes.system);
    }
    else {
      setTheme(resolvedTheme ?? Themes.light);
    }
  }, [resolvedTheme, setTheme]);

  const userPreferenceSwitchModifiedHandler = useCallback((isDarkMode: boolean) => {
    setTheme(isDarkMode ? Themes.dark : Themes.light);
  }, [setTheme]);

  /* eslint-disable react/prop-types */
  const IconWithTooltip = ({
    id, label, children, additionalClasses,
  }) => (
    <>
      <div id={id} className={`px-2 grw-icon-container ${additionalClasses != null ? additionalClasses : ''}`}>{children}</div>
      <UncontrolledTooltip placement="bottom" fade={false} target={id}>{label}</UncontrolledTooltip>
    </>
  );

  const renderSidebarModeSwitch = useCallback((isEditMode: boolean) => {
    return (
      <>
        <h6 className="dropdown-header">{t(isEditMode ? 'personal_dropdown.sidebar_mode_editor' : 'personal_dropdown.sidebar_mode')}</h6>
        <form className="px-4">
          <div className="form-row justify-content-center">
            <div className="form-group col-auto mb-0 d-flex align-items-center">
              <IconWithTooltip id={isEditMode ? 'iwt-sidebar-editor-drawer' : 'iwt-sidebar-drawer'} label="Drawer" additionalClasses="grw-sidebar-mode-icon">
                <SidebarDrawerIcon />
              </IconWithTooltip>
              <div className="custom-control custom-switch custom-checkbox-secondary ml-2">
                <input
                  id={isEditMode ? 'swSidebarModeOnEditor' : 'swSidebarMode'}
                  className="custom-control-input"
                  type="checkbox"
                  checked={isEditMode ? !isPreferDrawerModeOnEdit : !isPreferDrawerMode}
                  onChange={e => preferDrawerModeSwitchModifiedHandler(!e.target.checked, isEditMode)}
                />
                <label className="custom-control-label" htmlFor={isEditMode ? 'swSidebarModeOnEditor' : 'swSidebarMode'}></label>
              </div>
              <IconWithTooltip id={isEditMode ? 'iwt-sidebar-editor-dock' : 'iwt-sidebar-dock'} label="Dock" additionalClasses="grw-sidebar-mode-icon">
                <SidebarDockIcon />
              </IconWithTooltip>
            </div>
          </div>
        </form>
      </>
    );
  }, [isPreferDrawerMode, isPreferDrawerModeOnEdit, preferDrawerModeSwitchModifiedHandler, t]);

  return (
    <>
      {/* setting button */}
      {/* remove .dropdown-toggle for hide caret */}
      {/* See https://stackoverflow.com/a/44577512/13183572 */}
      <button className="bg-transparent border-0 nav-link" type="button" data-toggle="dropdown" ref={buttonRef} aria-haspopup="true">
        <i className="icon-settings"></i>
      </button>

      {/* dropdown */}
      <div className="dropdown-menu dropdown-menu-right">

        {/* sidebar mode */}
        {renderSidebarModeSwitch(false)}

        <div className="dropdown-divider"></div>

        {/* side bar mode on editor */}
        {isAuthenticated && renderSidebarModeSwitch(true)}

        <div className="dropdown-divider"></div>

        {/* color mode */}
        <h6 className="dropdown-header">{t('personal_dropdown.color_mode')}</h6>
        <form className="px-4">
          <div className="form-row justify-content-center">
            <div className="form-group col-auto d-flex align-items-center">
              <IconWithTooltip id="iwt-light" label="Light" additionalClasses={useOsSettings ? 'grw-color-mode-icon-muted' : 'grw-color-mode-icon'}>
                <SunIcon />
              </IconWithTooltip>
              <div className="custom-control custom-switch custom-checkbox-secondary ml-2">
                <input
                  id="swUserPreference"
                  className="custom-control-input"
                  type="checkbox"
                  checked={isDarkMode}
                  disabled={useOsSettings}
                  onChange={e => userPreferenceSwitchModifiedHandler(e.target.checked)}
                />
                <label className="custom-control-label" htmlFor="swUserPreference"></label>
              </div>
              <IconWithTooltip id="iwt-dark" label="Dark" additionalClasses={useOsSettings ? 'grw-color-mode-icon-muted' : 'grw-color-mode-icon'}>
                <MoonIcon />
              </IconWithTooltip>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-auto">
              <div className="custom-control custom-checkbox">
                <input
                  id="cbFollowOs"
                  className="custom-control-input"
                  type="checkbox"
                  checked={useOsSettings}
                  onChange={e => followOsCheckboxModifiedHandler(e.target.checked)}
                />
                <label className="custom-control-label text-nowrap" htmlFor="cbFollowOs">{t('personal_dropdown.use_os_settings')}</label>
              </div>
            </div>
          </div>
        </form>
      </div>

    </>
  );

};
