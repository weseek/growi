import React from 'react';

import EventEmitter from 'events';

import AppContainer from '~/client/services/AppContainer';
import { DescendantsPageListModal } from '~/components/DescendantsPageListModal';
import PutbackPageModal from '~/components/PutbackPageModal';
import ShortcutsModal from '~/components/ShortcutsModal';
import SystemVersion from '~/components/SystemVersion';
import InterceptorManager from '~/services/interceptor-manager';
import loggerFactory from '~/utils/logger';

import EmptyTrashModal from '../components/EmptyTrashModal';
import HotkeysManager from '../components/Hotkeys/HotkeysManager';
import { GrowiNavbar } from '../components/Navbar/GrowiNavbar';
import { GrowiNavbarBottom } from '../components/Navbar/GrowiNavbarBottom';
import PageAccessoriesModal from '../components/PageAccessoriesModal';
import PageCreateModal from '../components/PageCreateModal';
import PageDeleteModal from '../components/PageDeleteModal';
import PageDuplicateModal from '../components/PageDuplicateModal';
import PagePresentationModal from '../components/PagePresentationModal';
import PageRenameModal from '../components/PageRenameModal';

import ShowPageAccessoriesModal from './services/ShowPageAccessoriesModal';

const logger = loggerFactory('growi:cli:app');

if (!window) {
  window = {};
}

window.globalEmitter = new EventEmitter();
window.interceptorManager = new InterceptorManager();

// create unstated container instance
const appContainer = new AppContainer();

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
  'page-delete-modal': <PageDeleteModal />,
  'empty-trash-modal': <EmptyTrashModal />,
  'page-duplicate-modal': <PageDuplicateModal />,
  'page-rename-modal': <PageRenameModal />,
  'page-presentation-modal': <PagePresentationModal />,
  'page-accessories-modal': <PageAccessoriesModal />,
  'descendants-page-list-modal': <DescendantsPageListModal />,
  'page-put-back-modal': <PutbackPageModal />,
  'shortcuts-modal': <ShortcutsModal />,

  'grw-hotkeys-manager': <HotkeysManager />,
  'system-version': <SystemVersion />,


  'show-page-accessories-modal': <ShowPageAccessoriesModal />,
};

export { appContainer, componentMappings };
