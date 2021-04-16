import React from 'react';

import loggerFactory from '~/utils/logger';
import Xss from '~/service/xss';

import GrowiNavbar from './components/Navbar/GrowiNavbar';
import GrowiNavbarBottom from './components/Navbar/GrowiNavbarBottom';
import HotkeysManager from './components/Hotkeys/HotkeysManager';

import AppContainer from './services/AppContainer';
import SocketIoContainer from './services/SocketIoContainer';
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
const socketIoContainer = new SocketIoContainer(appContainer);

appContainer.initApp();

logger.info('AppContainer has been initialized');

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {
  'grw-navbar': <GrowiNavbar />,
  'grw-navbar-bottom-container': <GrowiNavbarBottom />,

  'page-create-modal': <PageCreateModal />,

  'grw-hotkeys-manager': <HotkeysManager />,

};

export { appContainer, componentMappings };
