import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import i18nFactory from './i18n';

import Xss from '../../lib/util/xss';

import Crowi from './util/Crowi';
// import CrowiRenderer from './util/CrowiRenderer';
import GrowiRenderer from './util/GrowiRenderer';

import HeaderSearchBox  from './components/HeaderSearchBox';
import SearchPage       from './components/SearchPage';
import PageEditor       from './components/PageEditor';
import OptionsSelector  from './components/PageEditor/OptionsSelector';
import { EditorOptions, PreviewOptions } from './components/PageEditor/OptionsSelector';
import GrantSelector    from './components/PageEditor/GrantSelector';
import PageEditorByHackmd from './components/PageEditorByHackmd';
import Page             from './components/Page';
import PageListSearch   from './components/PageListSearch';
import PageHistory      from './components/PageHistory';
import PageComments     from './components/PageComments';
import CommentForm from './components/PageComment/CommentForm';
import SlackNotification from './components/SlackNotification';
import PageAttachment   from './components/PageAttachment';
import SeenUserList     from './components/SeenUserList';
import RevisionPath     from './components/Page/RevisionPath';
import RevisionUrl      from './components/Page/RevisionUrl';
import BookmarkButton   from './components/BookmarkButton';
import NewPageNameInput from './components/NewPageNameInput';

import CustomCssEditor  from './components/Admin/CustomCssEditor';
import CustomScriptEditor from './components/Admin/CustomScriptEditor';
import CustomHeaderEditor from './components/Admin/CustomHeaderEditor';

import * as entities from 'entities';

if (!window) {
  window = {};
}

const userlang = $('body').data('userlang');
const i18n = i18nFactory(userlang);

// setup xss library
const xss = new Xss();
window.xss = xss;

const mainContent = document.querySelector('#content-main');
let pageId = null;
let pageRevisionId = null;
let pageRevisionCreatedAt = null;
let pageRevisionIdHackmdSynced = null;
let pageIdOnHackmd = null;
let pagePath;
let pageContent = '';
let markdown = '';
let slackChannels;
if (mainContent !== null) {
  pageId = mainContent.getAttribute('data-page-id');
  pageRevisionId = mainContent.getAttribute('data-page-revision-id');
  pageRevisionCreatedAt = +mainContent.getAttribute('data-page-revision-created');
  pageRevisionIdHackmdSynced = mainContent.getAttribute('data-page-revision-id-hackmd-synced') || null;
  pageIdOnHackmd = mainContent.getAttribute('data-page-id-on-hackmd') || null;
  pagePath = mainContent.attributes['data-path'].value;
  slackChannels = mainContent.getAttribute('data-slack-channels') || '';
  const rawText = document.getElementById('raw-text-original');
  if (rawText) {
    pageContent = rawText.innerHTML;
  }
  markdown = entities.decodeHTML(pageContent);
}
const isLoggedin = document.querySelector('.main-container.nologin') == null;

// FIXME
const crowi = new Crowi({
  me: $('body').data('current-username'),
  isAdmin: $('body').data('is-admin'),
  csrfToken: $('body').data('csrftoken'),
}, window);
window.crowi = crowi;
crowi.setConfig(JSON.parse(document.getElementById('crowi-context-hydrate').textContent || '{}'));
if (isLoggedin) {
  crowi.fetchUsers();
}

const crowiRenderer = new GrowiRenderer(crowi, null, {
  mode: 'page',
  isAutoSetup: false,                                     // manually setup because plugins may configure it
  renderToc: crowi.getCrowiForJquery().renderTocContent,  // function for rendering Table Of Contents
});
window.crowiRenderer = crowiRenderer;

// FIXME
const isEnabledPlugins = $('body').data('plugin-enabled');
if (isEnabledPlugins) {
  const crowiPlugin = window.crowiPlugin;
  crowiPlugin.installAll(crowi, crowiRenderer);
}

// setup renderer after plugins are installed
crowiRenderer.setup();

// restore draft when the first time to edit
const draft = crowi.findDraft(pagePath);
if (!pageRevisionId && draft != null) {
  markdown = draft;
}

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {
  'search-top': <HeaderSearchBox crowi={crowi} />,
  'search-sidebar': <HeaderSearchBox crowi={crowi} />,
  'search-page': <SearchPage crowi={crowi} crowiRenderer={crowiRenderer} />,
  'page-list-search': <PageListSearch crowi={crowi} />,

  //'revision-history': <PageHistory pageId={pageId} />,
  'seen-user-list': <SeenUserList pageId={pageId} crowi={crowi} />,
  'bookmark-button': <BookmarkButton pageId={pageId} crowi={crowi} />,
  'bookmark-button-lg': <BookmarkButton pageId={pageId} crowi={crowi} size="lg" />,

  'page-name-input': <NewPageNameInput crowi={crowi} parentPageName={pagePath} />,

};
// additional definitions if data exists
if (pageId) {
  componentMappings['page-comments-list'] = <PageComments pageId={pageId} revisionId={pageRevisionId} revisionCreatedAt={pageRevisionCreatedAt} crowi={crowi} crowiOriginRenderer={crowiRenderer} />;
  componentMappings['page-attachment'] = <PageAttachment pageId={pageId} pageContent={pageContent} crowi={crowi} />;
}
if (pagePath) {
  componentMappings['page'] = <Page crowi={crowi} crowiRenderer={crowiRenderer} markdown={markdown} pagePath={pagePath} showHeadEditButton={true} />;
  componentMappings['revision-path'] = <RevisionPath pagePath={pagePath} crowi={crowi} />;
  componentMappings['revision-url'] = <RevisionUrl pageId={pageId} pagePath={pagePath} />;
}

let componentInstances = {};

Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    componentInstances[key] = ReactDOM.render(componentMappings[key], elem);
  }
});

/*
 * PageEditor
 */
let pageEditor = null;
const editorOptions = new EditorOptions(crowi.editorOptions);
const previewOptions = new PreviewOptions(crowi.previewOptions);
// render PageEditor
const pageEditorElem = document.getElementById('page-editor');
if (pageEditorElem) {
  // create onSave event handler
  const onSaveSuccess = function(page) {
    // modify the revision id value to pass checking id when updating
    crowi.getCrowiForJquery().updatePageForm(page);
    // re-render Page component if exists
    if (componentInstances.page != null) {
      componentInstances.page.setMarkdown(page.revision.body);
    }
  };

  pageEditor = ReactDOM.render(
    <PageEditor crowi={crowi} crowiRenderer={crowiRenderer}
        pageId={pageId} revisionId={pageRevisionId} pagePath={pagePath}
        markdown={markdown}
        editorOptions={editorOptions} previewOptions={previewOptions}
        onSaveSuccess={onSaveSuccess} />,
    pageEditorElem
  );
  // set refs for pageEditor
  crowi.setPageEditor(pageEditor);
}

// render comment form
const writeCommentElem = document.getElementById('page-comment-write');
if (writeCommentElem) {
  const pageCommentsElem = componentInstances['page-comments-list'];
  const postCompleteHandler = (comment) => {
    if (pageCommentsElem != null) {
      pageCommentsElem.retrieveData();
    }
  };
  ReactDOM.render(
    <CommentForm crowi={crowi}
      crowiOriginRenderer={crowiRenderer}
      pageId={pageId}
      revisionId={pageRevisionId}
      pagePath={pagePath}
      onPostComplete={postCompleteHandler}
      editorOptions={editorOptions}
      slackChannels = {slackChannels}/>,
    writeCommentElem);
}

// render slack notification form
const editorSlackElem = document.getElementById('editor-slack-notification');
if (editorSlackElem) {
  ReactDOM.render(
    <SlackNotification
      crowi={crowi}
      pageId={pageId}
      pagePath={pagePath}
      isSlackEnabled={false}
      slackChannels={slackChannels}
      formName='pageForm' />,
    editorSlackElem);
}

// render OptionsSelector
const pageEditorOptionsSelectorElem = document.getElementById('page-editor-options-selector');
if (pageEditorOptionsSelectorElem) {
  ReactDOM.render(
    <OptionsSelector crowi={crowi}
        editorOptions={editorOptions} previewOptions={previewOptions}
        onChange={(newEditorOptions, newPreviewOptions) => { // set onChange event handler
          // set options
          pageEditor.setEditorOptions(newEditorOptions);
          pageEditor.setPreviewOptions(newPreviewOptions);
          // save
          crowi.saveEditorOptions(newEditorOptions);
          crowi.savePreviewOptions(newPreviewOptions);
        }} />,
    pageEditorOptionsSelectorElem
  );
}
// render GrantSelector
const pageEditorGrantSelectorElem = document.getElementById('page-grant-selector');
if (pageEditorGrantSelectorElem) {
  const grantElem = document.getElementById('page-grant');
  const grantGroupElem = document.getElementById('grant-group');
  const grantGroupNameElem = document.getElementById('grant-group-name');
  /* eslint-disable no-inner-declarations */
  function updateGrantElem(pageGrant) {
    grantElem.value = pageGrant;
  }
  function updateGrantGroupElem(grantGroupId) {
    grantGroupElem.value = grantGroupId;
  }
  function updateGrantGroupNameElem(grantGroupName) {
    grantGroupNameElem.value = grantGroupName;
  }
  /* eslint-enable */
  const pageGrant = +grantElem.value;
  const pageGrantGroupId = grantGroupElem.value;
  const pageGrantGroupName = grantGroupNameElem.value;
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <GrantSelector crowi={crowi}
        pageGrant={pageGrant} pageGrantGroupId={pageGrantGroupId} pageGrantGroupName={pageGrantGroupName}
        onChangePageGrant={updateGrantElem}
        onDeterminePageGrantGroupId={updateGrantGroupElem}
        onDeterminePageGrantGroupName={updateGrantGroupNameElem} />
    </I18nextProvider>,
    pageEditorGrantSelectorElem
  );
}

/*
 * HackMD Editor
 */
// render PageEditorWithHackmd
const pageEditorWithHackmdElem = document.getElementById('page-editor-with-hackmd');
if (pageEditorWithHackmdElem) {
  // create onSave event handler
  const onSaveSuccess = function(page) {
    // modify the revision id value to pass checking id when updating
    crowi.getCrowiForJquery().updatePageForm(page);
    // re-render Page component if exists
    if (componentInstances.page != null) {
      componentInstances.page.setMarkdown(page.revision.body);
    }
  };

  pageEditor = ReactDOM.render(
    <PageEditorByHackmd crowi={crowi}
        pageId={pageId} revisionId={pageRevisionId}
        revisionIdHackmdSynced={pageRevisionIdHackmdSynced} pageIdOnHackmd={pageIdOnHackmd}
        markdown={markdown}
        onSaveSuccess={onSaveSuccess} />,
    pageEditorWithHackmdElem
  );
}

// render for admin
const customCssEditorElem = document.getElementById('custom-css-editor');
if (customCssEditorElem != null) {
  // get input[type=hidden] element
  const customCssInputElem = document.getElementById('inputCustomCss');

  ReactDOM.render(
    <CustomCssEditor inputElem={customCssInputElem} />,
    customCssEditorElem
  );
}
const customScriptEditorElem = document.getElementById('custom-script-editor');
if (customScriptEditorElem != null) {
  // get input[type=hidden] element
  const customScriptInputElem = document.getElementById('inputCustomScript');

  ReactDOM.render(
    <CustomScriptEditor inputElem={customScriptInputElem} />,
    customScriptEditorElem
  );
}
const customHeaderEditorElem = document.getElementById('custom-header-editor');
if (customHeaderEditorElem != null) {
  // get input[type=hidden] element
  const customHeaderInputElem = document.getElementById('inputCustomHeader');

  ReactDOM.render(
    <CustomHeaderEditor inputElem={customHeaderInputElem} />,
    customHeaderEditorElem
  );
}

// うわーもうー (commented by Crowi team -- 2018.03.23 Yuki Takei)
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', function() {
  ReactDOM.render(<PageHistory pageId={pageId} crowi={crowi} />, document.getElementById('revision-history'));
});
