import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import UserPicture from '../User/UserPicture';

const PersonalDropdown = (props) => {

  const { t, appContainer } = props;
  const user = appContainer.currentUser || {};

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
    appContainer.setDrawerModePreference(bool);
  };

  const followOsCheckboxModifiedHandler = (bool) => {
    // reset user preference
    if (bool) {
      appContainer.setColorSchemePreference(null);
    }
    // set preferDarkModeByMediaQuery as users preference
    else {
      appContainer.setColorSchemePreference(appContainer.state.preferDarkModeByMediaQuery);
    }
  };

  const userPreferenceSwitchModifiedHandler = (bool) => {
    appContainer.setColorSchemePreference(bool);
  };


  /*
   * render
   */
  const { preferDarkModeByMediaQuery, preferDarkModeByUser, preferDrawerModeByUser } = appContainer.state;
  const isUserPreferenceExists = preferDarkModeByUser != null;
  const isDarkMode = () => {
    if (isUserPreferenceExists) {
      return preferDarkModeByUser;
    }
    return preferDarkModeByMediaQuery;
  };

  return (
    <>
      {/* Button */}
      {/* remove .dropdown-toggle for hide caret */}
      {/* See https://stackoverflow.com/a/44577512/13183572 */}
      <a className="nav-link waves-effect waves-light" data-toggle="dropdown">
        <UserPicture user={user} noLink noTooltip /><span className="d-none d-sm-inline-block">&nbsp;{user.name}</span>
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
            <a className="btn btn-sm btn-outline-secondary" href={`/user/${user.username}`}>
              <i className="icon-fw icon-home"></i>{ t('personal_dropdown.home') }
            </a>
            <a className="btn btn-sm btn-outline-secondary" href="/me">
              <i className="icon-fw icon-wrench"></i>{ t('personal_dropdown.settings') }
            </a>
          </div>
        </div>

        <div className="dropdown-divider"></div>

        <h6 className="dropdown-header">{t('personal_dropdown.sidebar_mode')}</h6>
        <form className="px-4">
          <div className="form-row justify-content-center">
            <div className="form-group col-auto mb-0 d-flex align-items-center">
              <i className="icon-drawer"></i>
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
              <i className="ti-layout-sidebar-left"></i>
            </div>
          </div>
        </form>
        <h6 className="dropdown-header">{t('personal_dropdown.sidebar_mode_editor')}</h6>
        <form className="px-4">
          <div className="form-row justify-content-center">
            <div className="form-group col-auto mb-0 d-flex align-items-center">
              <i className="icon-drawer"></i>
              <div className="custom-control custom-switch custom-checkbox-secondary ml-2">
                <input
                  id="swSidebarModeOnEditor"
                  className="custom-control-input"
                  type="checkbox"
                  // checked={}
                  // onChange={}
                />
                <label className="custom-control-label" htmlFor="swSidebarModeOnEditor"></label>
              </div>
              <i className="ti-layout-sidebar-left"></i>
            </div>
          </div>
        </form>

        <div className="dropdown-divider"></div>

        <h6 className="dropdown-header">{t('personal_dropdown.color_mode')}</h6>
        <form className="px-4">
          <div className="form-row">
            <div className="form-group col-auto">
              <div className="custom-control custom-checkbox">
                <input
                  id="cbFollowOs"
                  className="custom-control-input"
                  type="checkbox"
                  checked={!isUserPreferenceExists}
                  onChange={e => followOsCheckboxModifiedHandler(e.target.checked)}
                />
                <label className="custom-control-label text-nowrap" htmlFor="cbFollowOs">{t('personal_dropdown.use_os_settings')}</label>
              </div>
            </div>
          </div>
          <div className="form-row justify-content-center">
            <div className="form-group col-auto mb-0 d-flex align-items-center">
              <span className={isUserPreferenceExists ? '' : 'text-muted'}>Light</span>
              <div className="custom-control custom-switch custom-checkbox-secondary ml-2">
                <input
                  id="swUserPreference"
                  className="custom-control-input"
                  type="checkbox"
                  checked={isDarkMode()}
                  disabled={!isUserPreferenceExists}
                  onChange={e => userPreferenceSwitchModifiedHandler(e.target.checked)}
                />
                <label className="custom-control-label" htmlFor="swUserPreference"></label>
              </div>
              <span className={isUserPreferenceExists ? '' : 'text-muted'}>Dark</span>
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
const PersonalDropdownWrapper = (props) => {
  return createSubscribedElement(PersonalDropdown, props, [AppContainer]);
};


PersonalDropdown.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(PersonalDropdownWrapper);
