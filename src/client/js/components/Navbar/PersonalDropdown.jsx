import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { UncontrolledTooltip } from 'reactstrap';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import NavigationContainer from '../../services/NavigationContainer';

import {
  isUserPreferenceExists,
  isDarkMode as isDarkModeByUtil,
  applyColorScheme,
  removeUserPreference,
  updateUserPreference,
  updateUserPreferenceWithOsSettings,
} from '../../util/color-scheme';

import UserPicture from '../User/UserPicture';

import SidebarDrawerIcon from '../Icons/SidebarDrawerIcon';
import SidebarDockIcon from '../Icons/SidebarDockIcon';
import MoonIcon from '../Icons/MoonIcon';
import SunIcon from '../Icons/SunIcon';


const PersonalDropdown = (props) => {

  const { t, appContainer, navigationContainer } = props;
  const user = appContainer.currentUser || {};

  const [useOsSettings, setOsSettings] = useState(!isUserPreferenceExists());
  const [isDarkMode, setIsDarkMode] = useState(isDarkModeByUtil());

  const logoutHandler = () => {
    const { interceptorManager } = appContainer;

    const context = {
      user,
      currentPagePath: decodeURIComponent(window.location.pathname),
    };
    interceptorManager.process('logout', context);

    window.location.href = '/logout';
  };

  const preferDrawerModeSwitchModifiedHandler = (bool) => {
    navigationContainer.setDrawerModePreference(bool);
  };

  const preferDrawerModeOnEditSwitchModifiedHandler = (bool) => {
    navigationContainer.setDrawerModePreferenceOnEdit(bool);
  };

  const followOsCheckboxModifiedHandler = (bool) => {
    if (bool) {
      removeUserPreference();
    }
    else {
      updateUserPreferenceWithOsSettings();
    }
    applyColorScheme();

    // update states
    setOsSettings(bool);
    setIsDarkMode(isDarkModeByUtil());
  };

  const userPreferenceSwitchModifiedHandler = (bool) => {
    updateUserPreference(bool);
    applyColorScheme();

    // update state
    setIsDarkMode(isDarkModeByUtil());
  };


  /*
   * render
   */
  const {
    preferDrawerModeByUser, preferDrawerModeOnEditByUser,
  } = navigationContainer.state;

  /* eslint-disable react/prop-types */
  const IconWithTooltip = ({
    id, label, children, additionalClasses,
  }) => (
    <>
      <div id={id} className={`px-2 grw-icon-container ${additionalClasses != null ? additionalClasses : ''}`}>{children}</div>
      <UncontrolledTooltip placement="bottom" fade={false} target={id}>{label}</UncontrolledTooltip>
    </>
  );
  /* eslint-enable react/prop-types */

  return (
    <>
      {/* Button */}
      {/* remove .dropdown-toggle for hide caret */}
      {/* See https://stackoverflow.com/a/44577512/13183572 */}
      <a className="px-md-2 nav-link waves-effect waves-light" data-toggle="dropdown">
        <UserPicture user={user} noLink noTooltip /><span className="d-none d-lg-inline-block">&nbsp;{user.name}</span>
      </a>

      {/* Menu */}
      <div className="dropdown-menu dropdown-menu-right">

        <div className="px-4 pt-3 pb-2 text-center">
          <UserPicture user={user} size="lg" noLink noTooltip />

          <h5 className="mt-2">
            {user.name}
          </h5>

          <div className="my-2">
            <i className="icon-user icon-fw"></i>{user.username}<br />
            <i className="icon-envelope icon-fw"></i><span className="grw-email-sm">{user.email}</span>
          </div>

          <div className="btn-group btn-block mt-2" role="group">
            <a className="btn btn-sm btn-outline-secondary col" href={`/user/${user.username}`}>
              <i className="icon-fw icon-home"></i>{ t('personal_dropdown.home') }
            </a>
            <a className="btn btn-sm btn-outline-secondary col" href="/me">
              <i className="icon-fw icon-wrench"></i>{ t('personal_dropdown.settings') }
            </a>
          </div>
        </div>

        <div className="dropdown-divider"></div>

        {/* Sidebar Mode */}
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
                  checked={!preferDrawerModeByUser}
                  onChange={e => preferDrawerModeSwitchModifiedHandler(!e.target.checked)}
                />
                <label className="custom-control-label" htmlFor="swSidebarMode"></label>
              </div>
              <IconWithTooltip id="iwt-sidebar-dock" label="Dock">
                <SidebarDockIcon />
              </IconWithTooltip>
            </div>
          </div>
        </form>

        {/* Sidebar Mode on Editor */}
        <h6 className="dropdown-header">{t('personal_dropdown.sidebar_mode_editor')}</h6>
        <form className="px-4">
          <div className="form-row justify-content-center">
            <div className="form-group col-auto mb-0 d-flex align-items-center">
              <IconWithTooltip id="iwt-sidebar-editor-drawer" label="Drawer">
                <SidebarDrawerIcon />
              </IconWithTooltip>
              <div className="custom-control custom-switch custom-checkbox-secondary ml-2">
                <input
                  id="swSidebarModeOnEditor"
                  className="custom-control-input"
                  type="checkbox"
                  checked={!preferDrawerModeOnEditByUser}
                  onChange={e => preferDrawerModeOnEditSwitchModifiedHandler(!e.target.checked)}
                />
                <label className="custom-control-label" htmlFor="swSidebarModeOnEditor"></label>
              </div>
              <IconWithTooltip id="iwt-sidebar-editor-dock" label="Dock">
                <SidebarDockIcon />
              </IconWithTooltip>
            </div>
          </div>
        </form>

        <div className="dropdown-divider"></div>

        {/* Color Mode */}
        <h6 className="dropdown-header">{t('personal_dropdown.color_mode')}</h6>
        <form className="px-4">
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
          <div className="form-row justify-content-center">
            <div className="form-group col-auto mb-0 d-flex align-items-center">
              <IconWithTooltip id="iwt-light" label="Light" additionalClasses={useOsSettings ? 'grw-icon-container-muted' : ''}>
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
              <IconWithTooltip id="iwt-dark" label="Dark" additionalClasses={useOsSettings ? 'grw-icon-container-muted' : ''}>
                <MoonIcon />
              </IconWithTooltip>
            </div>
          </div>
        </form>

        <div className="dropdown-divider"></div>

        <button type="button" className="dropdown-item" onClick={logoutHandler}><i className="icon-fw icon-power"></i>{ t('Sign out') }</button>
      </div>

    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const PersonalDropdownWrapper = withUnstatedContainers(PersonalDropdown, [AppContainer, NavigationContainer]);


PersonalDropdown.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(PersonalDropdownWrapper);
