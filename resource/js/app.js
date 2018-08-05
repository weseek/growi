import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import * as toastr from 'toastr';

import io from 'socket.io-client';

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
import SavePageControls from './components/SavePageControls';
import PageEditorByHackmd from './components/PageEditorByHackmd';
import Page             from './components/Page';
import PageListSearch   from './components/PageListSearch';
import PageHistory      from './components/PageHistory';
import PageComments     from './components/PageComments';
import CommentForm from './components/PageComment/CommentForm';
import PageAttachment   from './components/PageAttachment';
import PageStatusAlert  from './components/PageStatusAlert';
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
let hasDraftOnHackmd = false;
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
  hasDraftOnHackmd = !!mainContent.getAttribute('data-page-has-draft-on-hackmd');
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


/**
 * save success handler when reloading is not needed
 * @param {object} page Page instance
 */
const saveWithShortcutSuccessHandler = function(page) {
  const editorMode = crowi.getCrowiForJquery().getCurrentEditorMode();

  // show toastr
  toastr.success(undefined, 'Saved successfully', {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '1200',
    extendedTimeOut: '150',
  });

  pageId = page._id;
  pageRevisionId = page.revision._id;

  // set page id to SavePageControls
  componentInstances.savePageControls.setPageId(pageId);

  // re-render Page component
  if (componentInstances.page != null) {
    componentInstances.page.setMarkdown(page.revision.body);
  }
  // re-render PageEditor component
  if (componentInstances.pageEditor != null) {
    const updateEditorValue = (editorMode !== 'builtin');
    componentInstances.pageEditor.setMarkdown(page.revision.body, updateEditorValue);
  }
  // set revision id to PageEditorByHackmd
  if (componentInstances.pageEditorByHackmd != null) {
    componentInstances.pageEditorByHackmd.setRevisionId(pageRevisionId);

    const updateEditorValue = (editorMode !== 'hackmd');
    componentInstances.pageEditorByHackmd.setMarkdown(page.revision.body, updateEditorValue);
  }
  // clear state of PageStatusAlert
  const pageStatusAlert = componentInstances.pageStatusAlert;
  if (componentInstances.pageStatusAlert != null) {
    pageStatusAlert.clearStatus(pageRevisionId);
  }
};

const errorHandler = function(error) {
  toastr.error(error.message, 'Error occured', {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  });
};

const saveWithShortcut = function(markdown) {
  const editorMode = crowi.getCrowiForJquery().getCurrentEditorMode();
  if (editorMode == null) {
    // do nothing
    return;
  }
  // get options
  const options = componentInstances.savePageControls.getCurrentOptionsToSave();

  let promise = undefined;
  if (pageId == null) {
    promise = crowi.createPage(pagePath, markdown, options);
  }
  else {
    promise = crowi.updatePage(pageId, pageRevisionId, markdown, options);
    options.isSyncRevisionToHackmd = true;
  }

  promise
    .then(saveWithShortcutSuccessHandler)
    .catch(errorHandler);
};

const saveWithSubmitButtonSuccessHandler = function() {
  crowi.clearDraft(pagePath);
  location.href = pagePath;
};

const saveWithSubmitButton = function() {
  const editorMode = crowi.getCrowiForJquery().getCurrentEditorMode();
  if (editorMode == null) {
    // do nothing
    return;
  }
  // get options
  const options = componentInstances.savePageControls.getCurrentOptionsToSave();

  let promise = undefined;
  // get markdown
  if (editorMode === 'builtin') {
    promise = Promise.resolve(componentInstances.pageEditor.getMarkdown());
  }
  else {
    promise = componentInstances.pageEditorByHackmd.getMarkdown();
    options.isSyncRevisionToHackmd = true;
  }
  // create or update
  if (pageId == null) {
    promise = promise.then(markdown => {
      return crowi.createPage(pagePath, markdown, options);
    });
  }
  else {
    promise = promise.then(markdown => {
      return crowi.updatePage(pageId, pageRevisionId, markdown, options);
    });
  }

  promise
    .then(saveWithSubmitButtonSuccessHandler)
    .catch(errorHandler);
};

// render SavePageControls
let savePageControls = null;
const savePageControlsElem = document.getElementById('save-page-controls');
if (savePageControlsElem) {
  const grant = +savePageControlsElem.dataset.grant;
  const grantGroupId = savePageControlsElem.dataset.grantGroup;
  const grantGroupName = savePageControlsElem.dataset.grantGroupName;
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <SavePageControls crowi={crowi} onSubmit={saveWithSubmitButton}
          ref={(elem) => {
            if (savePageControls == null) {
              savePageControls = elem.getWrappedInstance();
            }
          }}
          pageId={pageId} pagePath={pagePath} slackChannels={slackChannels}
          grant={grant} grantGroupId={grantGroupId} grantGroupName={grantGroupName} />
    </I18nextProvider>,
    savePageControlsElem
  );
  componentInstances.savePageControls = savePageControls;
}

/*
 * HackMD Editor
 */
// render PageEditorWithHackmd
let pageEditorByHackmd = null;
const pageEditorWithHackmdElem = document.getElementById('page-editor-with-hackmd');
if (pageEditorWithHackmdElem) {
  pageEditorByHackmd = ReactDOM.render(
    <PageEditorByHackmd crowi={crowi}
        pageId={pageId} revisionId={pageRevisionId}
        pageIdOnHackmd={pageIdOnHackmd} revisionIdHackmdSynced={pageRevisionIdHackmdSynced} hasDraftOnHackmd={hasDraftOnHackmd}
        markdown={markdown}
        onSaveWithShortcut={saveWithShortcut} />,
    pageEditorWithHackmdElem
  );
  componentInstances.pageEditorByHackmd = pageEditorByHackmd;
}


/*
 * PageEditor
 */
let pageEditor = null;
const editorOptions = new EditorOptions(crowi.editorOptions);
const previewOptions = new PreviewOptions(crowi.previewOptions);
// render PageEditor
const pageEditorElem = document.getElementById('page-editor');
if (pageEditorElem) {
  pageEditor = ReactDOM.render(
    <PageEditor crowi={crowi} crowiRenderer={crowiRenderer}
        pageId={pageId} revisionId={pageRevisionId} pagePath={pagePath}
        markdown={markdown}
        editorOptions={editorOptions} previewOptions={previewOptions}
        onSaveWithShortcut={saveWithShortcut} />,
    pageEditorElem
  );
  componentInstances.pageEditor = pageEditor;
  // set refs for setCaretLine/forceToFocus when tab is changed
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
      pagePath={pagePath}
      onPostComplete={postCompleteHandler}
      editorOptions={editorOptions}
      slackChannels = {slackChannels}/>,
    writeCommentElem);
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

// render PageStatusAlert
let pageStatusAlert = null;
const pageStatusAlertElem = document.getElementById('page-status-alert');
if (pageStatusAlertElem) {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <PageStatusAlert crowi={crowi}
          ref={(elem) => {
            if (pageStatusAlert == null) {
              pageStatusAlert = elem.getWrappedInstance();
            }
          }}
          revisionId={pageRevisionId} hasDraftOnHackmd={hasDraftOnHackmd} />
    </I18nextProvider>,
    pageStatusAlertElem
  );
  componentInstances.pageStatusAlert = pageStatusAlert;
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

// notification from websocket
const socket = io();
socket.on('page:update', function(data) {
  // skip own trigger
  if (data.user.username === crowi.me) {
    return;
  }
  if (data.page.path == pagePath) {
    // update PageStatusAlert
    const pageStatusAlert = componentInstances.pageStatusAlert;
    if (pageStatusAlert != null) {
      pageStatusAlert.setLatestRevisionId(data.page._id.toString());
      pageStatusAlert.setLastUpdateUsername(data.user.name);
    }
    // update PageEditorByHackmd
    const pageEditorByHackmd = componentInstances.pageEditorByHackmd;
    if (pageEditorByHackmd != null) {
      pageEditorByHackmd.setHasDraftOnHackmd(data.page.hasDraftOnHackmd);
    }
  }
});
socket.on('page:editingWithHackmd', function(data) {
  if (data.page.path == pagePath) {
    // update PageStatusAlert
    const pageStatusAlert = componentInstances.pageStatusAlert;
    if (pageStatusAlert != null) {
      pageStatusAlert.setHasDraftOnHackmd(data.page.hasDraftOnHackmd);
    }
    // update PageEditorByHackmd
    const pageEditorByHackmd = componentInstances.pageEditorByHackmd;
    if (pageEditorByHackmd != null) {
      pageEditorByHackmd.setHasDraftOnHackmd(data.page.hasDraftOnHackmd);
    }
  }
});

// うわーもうー (commented by Crowi team -- 2018.03.23 Yuki Takei)
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', function() {
  ReactDOM.render(<PageHistory pageId={pageId} crowi={crowi} />, document.getElementById('revision-history'));
});
