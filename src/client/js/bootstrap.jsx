import React from 'react';

import loggerFactory from '@alias/logger';
import Xss from '@commons/service/xss';

import HeaderSearchBox from './components/HeaderSearchBox';
import PersonalDropdown from './components/Navbar/PersonalDropdown';
import StaffCredit from './components/StaffCredit/StaffCredit';

import AppContainer from './services/AppContainer';
import WebsocketContainer from './services/WebsocketContainer';

const logger = loggerFactory('growi:app');

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

logger.info('unstated containers have been initialized');

appContainer.initPlugins();
appContainer.injectToWindow();

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {
  'search-top': <HeaderSearchBox />,
  'search-sidebar': <HeaderSearchBox crowi={appContainer} />,
  'personal-dropdown': <PersonalDropdown />,

  'staff-credit': <StaffCredit />,
};

export { appContainer, componentMappings };
