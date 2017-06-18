import React from 'react';
import ReactDOM from 'react-dom';

import Crowi from './util/Crowi';
import CrowiRenderer from './util/CrowiRenderer';

import HeaderSearchBox  from './components/HeaderSearchBox';
import SearchPage       from './components/SearchPage';
import PageListSearch   from './components/PageListSearch';
import PageHistory      from './components/PageHistory';
import PageComments     from './components/PageComments';
import PageCommentFormBehavior from './components/PageCommentFormBehavior';
import PageAttachment   from './components/PageAttachment';
import SeenUserList     from './components/SeenUserList';
import RevisionPath     from './components/Page/RevisionPath';
import RevisionUrl      from './components/Page/RevisionUrl';
import BookmarkButton   from './components/BookmarkButton';

if (!window) {
  window = {};
}

const mainContent = document.querySelector('#content-main');
let pageId = null;
let pageRevisionId = null;
let pageRevisionCreatedAt = null;
let pagePath;
let pageContent = null;
if (mainContent !== null) {
  pageId = mainContent.attributes['data-page-id'].value;
  pageRevisionId = mainContent.attributes['data-page-revision-id'].value;
  pageRevisionCreatedAt = +mainContent.attributes['data-page-revision-created'].value;
  pagePath = mainContent.attributes['data-path'].value;
  const rawText = document.getElementById('raw-text-original');
  if (rawText) {
    pageContent = rawText.innerHTML;
  }
}

// FIXME
const crowi = new Crowi({
  me: $('#content-main').data('current-username'),
  csrfToken: $('#content-main').data('csrftoken'),
}, window);
window.crowi = crowi;
crowi.setConfig(JSON.parse(document.getElementById('crowi-context-hydrate').textContent || '{}'));
crowi.fetchUsers();

const crowiRenderer = new CrowiRenderer(crowi);
window.crowiRenderer = crowiRenderer;

// FIXME
var isEnabledPlugins = $('body').data('plugin-enabled');
if (isEnabledPlugins) {
  var crowiPlugin = window.crowiPlugin;
  crowiPlugin.installAll(crowi, crowiRenderer);
}

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {
  'search-top': <HeaderSearchBox crowi={crowi} />,
  'search-page': <SearchPage crowi={crowi} />,
  'page-list-search': <PageListSearch crowi={crowi} />,
  'page-comments-list': <PageComments pageId={pageId} revisionId={pageRevisionId} revisionCreatedAt= {pageRevisionCreatedAt} crowi={crowi} />,
  'page-attachment': <PageAttachment pageId={pageId} pageContent={pageContent} crowi={crowi} />,

  //'revision-history': <PageHistory pageId={pageId} />,
  'seen-user-list': <SeenUserList pageId={pageId} crowi={crowi} />,
  'bookmark-button': <BookmarkButton pageId={pageId} crowi={crowi} />,
};
// additional definitions if pagePath exists
if (pagePath) {
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

// render components with refs to another component
const elem = document.getElementById('page-comment-form-behavior');
if (elem) {
  ReactDOM.render(<PageCommentFormBehavior crowi={crowi} pageComments={componentInstances['page-comments-list']} />, elem);
}

// うわーもうー
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', function() {
  ReactDOM.render(<PageHistory pageId={pageId} crowi={crowi} />, document.getElementById('revision-history'));
});
