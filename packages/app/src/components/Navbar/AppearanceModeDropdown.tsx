import React, { FC, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

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

  const [useOsSettings, setOsSettings] = useState(false);

  /* eslint-disable react/prop-types */
  const IconWithTooltip = ({
    id, label, children, additionalClasses,
  }) => (
    <>
      <div id={id} className={`px-2 grw-icon-container ${additionalClasses != null ? additionalClasses : ''}`}>{children}</div>
      <UncontrolledTooltip placement="bottom" fade={false} target={id}>{label}</UncontrolledTooltip>
    </>
  );

  const renderSidebarModeSwitch = (isEditMode: boolean) => {
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
                  onChange={() => console.log('changed!')}
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
  };

  return (
    <>
      {/* setting button */}
      <button className="bg-transparent border-0 nav-link" type="button" data-toggle="dropdown" aria-haspopup="true">
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
                  onChange={() => console.log('changed!')}
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
                  onChange={() => console.log('changed!')}
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
