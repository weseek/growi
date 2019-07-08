/* eslint-disable max-len */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { I18nextProvider } from 'react-i18next';

import loggerFactory from '@alias/logger';
import Xss from '@commons/service/xss';

import HeaderSearchBox from './components/HeaderSearchBox';
import SearchPage from './components/SearchPage';
import TagsList from './components/TagsList';
import PageEditor from './components/PageEditor';
// eslint-disable-next-line import/no-duplicates
import OptionsSelector from './components/PageEditor/OptionsSelector';
// eslint-disable-next-line import/no-duplicates
import { defaultEditorOptions, defaultPreviewOptions } from './components/PageEditor/OptionsSelector';
import SavePageControls from './components/SavePageControls';
import PageEditorByHackmd from './components/PageEditorByHackmd';
import Page from './components/Page';
import PageHistory from './components/PageHistory';
import PageComments from './components/PageComments';
import CommentEditorLazyRenderer from './components/PageComment/CommentEditorLazyRenderer';
import PageAttachment from './components/PageAttachment';
import PageStatusAlert from './components/PageStatusAlert';
import RevisionPath from './components/Page/RevisionPath';
import TagLabels from './components/Page/TagLabels';
import BookmarkButton from './components/BookmarkButton';
import LikeButton from './components/LikeButton';
import PagePathAutoComplete from './components/PagePathAutoComplete';
import RecentCreated from './components/RecentCreated/RecentCreated';
import StaffCredit from './components/StaffCredit/StaffCredit';
import MyDraftList from './components/MyDraftList/MyDraftList';
import UserPictureList from './components/User/UserPictureList';

import CustomCssEditor from './components/Admin/CustomCssEditor';
import CustomScriptEditor from './components/Admin/CustomScriptEditor';
import CustomHeaderEditor from './components/Admin/CustomHeaderEditor';
import AdminRebuildSearch from './components/Admin/AdminRebuildSearch';
import UserGroupPage from './components/Admin/UserGroup/UserGroupPage';
import Importer from './components/Admin/Importer';
import FullTextSearchManagement from './components/Admin/FullTextSearchManagement/FullTextSearchPage';

import AppContainer from './services/AppContainer';
import PageContainer from './services/PageContainer';
import CommentContainer from './services/CommentContainer';
import EditorContainer from './services/EditorContainer';
import TagContainer from './services/TagContainer';
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
const websocketContainer = new WebsocketContainer(appContainer);
const pageContainer = new PageContainer(appContainer);
const commentContainer = new CommentContainer(appContainer);
const editorContainer = new EditorContainer(appContainer, defaultEditorOptions, defaultPreviewOptions);
const tagContainer = new TagContainer(appContainer);
const injectableContainers = [
  appContainer, websocketContainer, pageContainer, commentContainer, editorContainer, tagContainer,
];

logger.info('unstated containers have been initialized');

appContainer.initPlugins();
appContainer.injectToWindow();

const i18n = appContainer.i18n;

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
let componentMappings = {
  'search-top': <HeaderSearchBox crowi={appContainer} />,
  'search-sidebar': <HeaderSearchBox crowi={appContainer} />,
  'search-page': <SearchPage crowi={appContainer} />,

  // 'revision-history': <PageHistory pageId={pageId} />,
  'tags-page': <TagsList crowi={appContainer} />,

  'create-page-name-input': <PagePathAutoComplete crowi={appContainer} initializedPath={pageContainer.state.path} addTrailingSlash />,

  'page-editor': <PageEditor />,
  'page-editor-options-selector': <OptionsSelector crowi={appContainer} />,
  'page-status-alert': <PageStatusAlert />,
  'save-page-controls': <SavePageControls />,

  'user-created-list': <RecentCreated />,
  'user-draft-list': <MyDraftList />,

  'staff-credit': <StaffCredit />,
};

// additional definitions if data exists
if (pageContainer.state.pageId != null) {
  componentMappings = Object.assign({
    'page-editor-with-hackmd': <PageEditorByHackmd />,
    'page-comments-list': <PageComments />,
    'page-attachment':  <PageAttachment />,
    'page-comment-write':  <CommentEditorLazyRenderer />,
    'like-button': <LikeButton pageId={pageContainer.state.pageId} isLiked={pageContainer.state.isLiked} />,
    'seen-user-list': <UserPictureList userIds={pageContainer.state.seenUserIds} />,
    'liker-list': <UserPictureList userIds={pageContainer.state.likerUserIds} />,
    'bookmark-button':  <BookmarkButton pageId={pageContainer.state.pageId} crowi={appContainer} />,
    'bookmark-button-lg':  <BookmarkButton pageId={pageContainer.state.pageId} crowi={appContainer} size="lg" />,
    'rename-page-name-input':  <PagePathAutoComplete crowi={appContainer} initializedPath={pageContainer.state.path} />,
    'duplicate-page-name-input':  <PagePathAutoComplete crowi={appContainer} initializedPath={pageContainer.state.path} />,

    'admin-rebuild-search': <AdminRebuildSearch crowi={appContainer} />,
  }, componentMappings);
}
if (pageContainer.state.path != null) {
  componentMappings = Object.assign({
    // eslint-disable-next-line quote-props
    'page': <Page />,
    'revision-path': <RevisionPath behaviorType={appContainer.config.behaviorType} pageId={pageContainer.state.pageId} pagePath={pageContainer.state.path} />,
    'tag-label':  <TagLabels />,
  }, componentMappings);
}

Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    ReactDOM.render(
      <I18nextProvider i18n={i18n}>
        <Provider inject={injectableContainers}>
          {componentMappings[key]}
        </Provider>
      </I18nextProvider>,
      elem,
    );
  }
});

// render for admin
const customCssEditorElem = document.getElementById('custom-css-editor');
if (customCssEditorElem != null) {
  // get input[type=hidden] element
  const customCssInputElem = document.getElementById('inputCustomCss');

  ReactDOM.render(
    <CustomCssEditor inputElem={customCssInputElem} />,
    customCssEditorElem,
  );
}
const customScriptEditorElem = document.getElementById('custom-script-editor');
if (customScriptEditorElem != null) {
  // get input[type=hidden] element
  const customScriptInputElem = document.getElementById('inputCustomScript');

  ReactDOM.render(
    <CustomScriptEditor inputElem={customScriptInputElem} />,
    customScriptEditorElem,
  );
}
const customHeaderEditorElem = document.getElementById('custom-header-editor');
if (customHeaderEditorElem != null) {
  // get input[type=hidden] element
  const customHeaderInputElem = document.getElementById('inputCustomHeader');

  ReactDOM.render(
    <CustomHeaderEditor inputElem={customHeaderInputElem} />,
    customHeaderEditorElem,
  );
}

const adminUserGroupPageElem = document.getElementById('admin-user-group-page');
if (adminUserGroupPageElem != null) {
  const isAclEnabled = adminUserGroupPageElem.getAttribute('data-isAclEnabled') === 'true';

  ReactDOM.render(
    <Provider inject={[]}>
      <I18nextProvider i18n={i18n}>
        <UserGroupPage
          crowi={appContainer}
          isAclEnabled={isAclEnabled}
        />
      </I18nextProvider>
    </Provider>,
    adminUserGroupPageElem,
  );
}

const adminImporterElem = document.getElementById('admin-importer');
if (adminImporterElem != null) {
  ReactDOM.render(
    <Importer />,
    adminImporterElem,
  );
}

const adminFullTextSearchManagementElem = document.getElementById('admin-full-text-search-management');
if (adminFullTextSearchManagementElem != null) {

  ReactDOM.render(
    <FullTextSearchManagement />,
    adminFullTextSearchManagementElem,
  );
}

// うわーもうー (commented by Crowi team -- 2018.03.23 Yuki Takei)
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', () => {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <PageHistory pageId={pageContainer.state.pageId} crowi={appContainer} />
    </I18nextProvider>, document.getElementById('revision-history'),
  );
});
