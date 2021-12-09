import React from 'react';

import Xss from '~/services/xss';
import loggerFactory from '~/utils/logger';

import GrowiNavbar from '../components/Navbar/GrowiNavbar';
import GrowiNavbarBottom from '../components/Navbar/GrowiNavbarBottom';
import HotkeysManager from '../components/Hotkeys/HotkeysManager';
import PageCreateModal from '../components/PageCreateModal';

import AppContainer from '~/client/services/AppContainer';
import SocketIoContainer from '~/client/services/SocketIoContainer';

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
const socketIoContainer = new SocketIoContainer(appContainer);

appContainer.initApp();

logger.info('AppContainer has been initialized');

const isSearchPage = document.getElementById('search-page') != null;

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {

  'grw-navbar-bottom-container': <GrowiNavbarBottom />,

  'page-create-modal': <PageCreateModal />,

  'grw-hotkeys-manager': <HotkeysManager />,

};
// hide GrowiNavBar when SearchPage is shown
if (!isSearchPage) {
  Object.assign(componentMappings, { 'grw-navbar': <GrowiNavbar /> });
}

export { appContainer, componentMappings };
