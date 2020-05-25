import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { I18nextProvider } from 'react-i18next';

import loggerFactory from '@alias/logger';

import ErrorBoundary from './components/ErrorBoudary';
import SearchPage from './components/SearchPage';
import TagsList from './components/TagsList';
import PageEditor from './components/PageEditor';
import PagePathNavForEditor from './components/PageEditor/PagePathNavForEditor';
// eslint-disable-next-line import/no-duplicates
import OptionsSelector from './components/PageEditor/OptionsSelector';
// eslint-disable-next-line import/no-duplicates
import { defaultEditorOptions, defaultPreviewOptions } from './components/PageEditor/OptionsSelector';
import SavePageControls from './components/SavePageControls';
import PageEditorByHackmd from './components/PageEditorByHackmd';
import Page from './components/Page';
import PageHistory from './components/PageHistory';
import PageComments from './components/PageComments';
import PageTimeline from './components/PageTimeline';
import CommentEditorLazyRenderer from './components/PageComment/CommentEditorLazyRenderer';
import PageManagement from './components/Page/PageManagement';
import PageDuplicateModal from './components/PageDuplicateModal';
import TrashPageAlert from './components/Page/TrashPageAlert';
import PageAttachment from './components/PageAttachment';
import PageStatusAlert from './components/PageStatusAlert';
import PagePathAutoComplete from './components/PagePathAutoComplete';
import RecentCreated from './components/RecentCreated/RecentCreated';
import MyDraftList from './components/MyDraftList/MyDraftList';
import UserPictureList from './components/User/UserPictureList';
import TableOfContents from './components/TableOfContents';

import PersonalSettings from './components/Me/PersonalSettings';
import PageContainer from './services/PageContainer';
import CommentContainer from './services/CommentContainer';
import EditorContainer from './services/EditorContainer';
import TagContainer from './services/TagContainer';
import GrowiSubNavigation from './components/Navbar/GrowiSubNavigation';
import GrowiSubNavigationForUserPage from './components/Navbar/GrowiSubNavigationForUserPage';
import PersonalContainer from './services/PersonalContainer';

import { appContainer, componentMappings } from './bootstrap';

const logger = loggerFactory('growi:app');

const { i18n } = appContainer;
const websocketContainer = appContainer.getContainer('WebsocketContainer');

// create unstated container instance
const pageContainer = new PageContainer(appContainer);
const commentContainer = new CommentContainer(appContainer);
const editorContainer = new EditorContainer(appContainer, defaultEditorOptions, defaultPreviewOptions);
const tagContainer = new TagContainer(appContainer);
const personalContainer = new PersonalContainer(appContainer);
const injectableContainers = [
  appContainer, websocketContainer, pageContainer, commentContainer, editorContainer, tagContainer, personalContainer,
];

logger.info('unstated containers have been initialized');

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
Object.assign(componentMappings, {
  'search-page': <SearchPage crowi={appContainer} />,

  // 'revision-history': <PageHistory pageId={pageId} />,
  'tags-page': <TagsList crowi={appContainer} />,

  'page-editor': <PageEditor />,
  'page-editor-path-nav': <PagePathNavForEditor />,
  'page-editor-options-selector': <OptionsSelector crowi={appContainer} />,
  'page-status-alert': <PageStatusAlert />,
  'save-page-controls': <SavePageControls />,

  'trash-page-alert': <TrashPageAlert />,

  'page-timeline': <PageTimeline />,

  'personal-setting': <PersonalSettings crowi={personalContainer} />,
});

// additional definitions if data exists
if (pageContainer.state.pageId != null) {
  Object.assign(componentMappings, {
    'page-editor-with-hackmd': <PageEditorByHackmd />,
    'page-comments-list': <PageComments />,
    'page-attachment': <PageAttachment />,
    'page-comment-write': <CommentEditorLazyRenderer />,
    'page-management': <PageManagement />,
    'page-duplicate-modal': <PageDuplicateModal />,

    'revision-toc': <TableOfContents />,
    'seen-user-list': <UserPictureList userIds={pageContainer.state.seenUserIds} />,
    'liker-list': <UserPictureList userIds={pageContainer.state.likerUserIds} />,
    'rename-page-name-input': <PagePathAutoComplete crowi={appContainer} initializedPath={pageContainer.state.path} />,

    'user-created-list': <RecentCreated />,
    'user-draft-list': <MyDraftList />,
  });
}
if (pageContainer.state.path != null) {
  Object.assign(componentMappings, {
    // eslint-disable-next-line quote-props
    'page': <Page />,
    'grw-subnav': <GrowiSubNavigation />,
    'grw-subnav-for-user-page': <GrowiSubNavigationForUserPage />,
  });
}

Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    ReactDOM.render(
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <Provider inject={injectableContainers}>
            {componentMappings[key]}
          </Provider>
        </ErrorBoundary>
      </I18nextProvider>,
      elem,
    );
  }
});

// うわーもうー (commented by Crowi team -- 2018.03.23 Yuki Takei)
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', () => {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <PageHistory pageId={pageContainer.state.pageId} crowi={appContainer} />
      </ErrorBoundary>
    </I18nextProvider>, document.getElementById('revision-history'),
  );
});

// initialize scrollpos-styler
ScrollPosStyler.init();
