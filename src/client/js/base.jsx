import React from 'react';

import loggerFactory from '@alias/logger';
import Xss from '@commons/service/xss';

import SearchTop from './components/Navbar/SearchTop';
import NavbarToggler from './components/Navbar/NavbarToggler';
import PersonalDropdown from './components/Navbar/PersonalDropdown';
import Sidebar from './components/Sidebar';
import StaffCredit from './components/StaffCredit/StaffCredit';

import AppContainer from './services/AppContainer';
import WebsocketContainer from './services/WebsocketContainer';
import PageCreateButton from './components/Navbar/PageCreateButton';
import PageCreateModal from './components/PageCreateModal';

const logger = loggerFactory('growi:cli:app');

if (!window) {
  window = {};
}

// setup xss library
const xss = new Xss();
window.xss = xss;

// create unstated container instance
const appContainer = new AppContainer();
// eslint-disable-next-line no-unused-vars
const websocketContainer = new WebsocketContainer(appContainer);

appContainer.initApp();

logger.info('AppContainer has been initialized');

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {
  'grw-navbar-toggler': <NavbarToggler />,

  'grw-search-top': <SearchTop />,
  'personal-dropdown': <PersonalDropdown />,

  'create-page-button': <PageCreateButton />,
  'create-page-button-icon': <PageCreateButton isIcon />,
  'page-create-modal': <PageCreateModal />,

  'grw-sidebar-wrapper': <Sidebar />,

  'staff-credit': <StaffCredit />,
};

export { appContainer, componentMappings };
