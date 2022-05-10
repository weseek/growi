import React from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import MoonIcon from '../Icons/MoonIcon';
import SidebarDockIcon from '../Icons/SidebarDockIcon';
import SidebarDrawerIcon from '../Icons/SidebarDrawerIcon';
import SunIcon from '../Icons/SunIcon';


const GuestDropdown = (): JSX.Element => {

  const { t } = useTranslation();

  /* eslint-disable react/prop-types */
  const IconWithTooltip = ({
    id, label, children, additionalClasses = null,
  }) => (
    <>
      <div id={id} className={`px-2 grw-icon-container ${additionalClasses != null ? additionalClasses : ''}`}>{children}</div>
      <UncontrolledTooltip placement="bottom" fade={false} target={id}>{label}</UncontrolledTooltip>
    </>
  );

  return (
    <>
      {/* setting button */}
      <a className="px-md-3 nav-link waves-effect waves-light" data-toggle="dropdown">
        <i className="material-icons">settings</i>
      </a>

      {/* dropdown */}
      <div className="dropdown-menu dropdown-menu-right">

        {/* sidebar mode */}
        <h6 className="dropdown-header">{t('personal_dropdown.sidebar_mode')}</h6>
        <form className="px-4">
          <div className="form-row justify-content-center">
            <div className="form-group col-auto mb-0 d-flex align-items-center">
              <IconWithTooltip id="iwt-sidebar-drawer" label="Drawer">
                <SidebarDrawerIcon />
              </IconWithTooltip>
              <div className="custom-control custom-switch custom-checkbox-secondary ml-2">
                <input
                  id="swSidebarMode"
                  className="custom-control-input"
                  type="checkbox"
                  // checked={!isPreferDrawerMode}
                  // onChange={e => preferDrawerModeSwitchModifiedHandler(!e.target.checked)}
                  onChange={() => console.log('changed!')}
                />
                <label className="custom-control-label" htmlFor="swSidebarMode"></label>
              </div>
              <IconWithTooltip id="iwt-sidebar-dock" label="Dock">
                <SidebarDockIcon />
              </IconWithTooltip>
            </div>
          </div>
        </form>

        <div className="dropdown-divider"></div>

        {/* color mode */}
        <h6 className="dropdown-header">{t('personal_dropdown.color_mode')}</h6>
        <form className="px-4">
          <div className="form-row">
            <div className="form-group col-auto">
              <div className="custom-control custom-checkbox">
                <input
                  id="cbFollowOs"
                  className="custom-control-input"
                  type="checkbox"
                  // checked={useOsSettings}
                  // onChange={e => followOsCheckboxModifiedHandler(e.target.checked)}
                  onChange={() => console.log('changed!')}
                />
                <label className="custom-control-label text-nowrap" htmlFor="cbFollowOs">{t('personal_dropdown.use_os_settings')}</label>
              </div>
            </div>
          </div>
          <div className="form-row justify-content-center">
            <div className="form-group col-auto mb-0 d-flex align-items-center">
              {/* <IconWithTooltip id="iwt-light" label="Light" additionalClasses={useOsSettings ? 'grw-icon-container-muted' : ''}> */}
              <IconWithTooltip id="iwt-light" label="Light">
                <SunIcon />
              </IconWithTooltip>
              <div className="custom-control custom-switch custom-checkbox-secondary ml-2">
                <input
                  id="swUserPreference"
                  className="custom-control-input"
                  type="checkbox"
                  // checked={isDarkMode}
                  // disabled={useOsSettings}
                  // onChange={e => userPreferenceSwitchModifiedHandler(e.target.checked)}
                  onChange={() => console.log('changed!')}
                />
                <label className="custom-control-label" htmlFor="swUserPreference"></label>
              </div>
              {/* <IconWithTooltip id="iwt-dark" label="Dark" additionalClasses={useOsSettings ? 'grw-icon-container-muted' : ''}> */}
              <IconWithTooltip id="iwt-dark" label="Dark">
                <MoonIcon />
              </IconWithTooltip>
            </div>
          </div>
        </form>


      </div>

    </>
  );

};

export default GuestDropdown;
