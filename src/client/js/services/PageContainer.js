import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import * as entities from 'entities';
import * as toastr from 'toastr';

const logger = loggerFactory('growi:services:PageContainer');

/**
 * Service container related to Page
 * @extends {Container} unstated Container
 */
export default class PageContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    this.state = {};

    const mainContent = document.querySelector('#content-main');
    if (mainContent == null) {
      logger.debug('#content-main element is not exists');
      return;
    }

    const revisionId = mainContent.getAttribute('data-page-revision-id');

    this.state = {
      // local page data
      markdown: null, // will be initialized after initStateMarkdown()
      pageId: mainContent.getAttribute('data-page-id'),
      revisionId,
      revisionCreatedAt: +mainContent.getAttribute('data-page-revision-created'),
      path: mainContent.getAttribute('data-path'),
      isLiked: false,
      seenUserIds: [],
      likerUserIds: [],

      tags: [],
      templateTagData: mainContent.getAttribute('data-template-tags'),

      // latest(on remote) information
      remoteRevisionId: revisionId,
      revisionIdHackmdSynced: mainContent.getAttribute('data-page-revision-id-hackmd-synced'),
      lastUpdateUsername: undefined,
      pageIdOnHackmd: mainContent.getAttribute('data-page-id-on-hackmd'),
      hasDraftOnHackmd: !!mainContent.getAttribute('data-page-has-draft-on-hackmd'),
      isHackmdDraftUpdatingInRealtime: false,
    };

    this.initStateMarkdown();
    this.initStateOthers();

    this.save = this.save.bind(this);
    this.addWebSocketEventHandlers = this.addWebSocketEventHandlers.bind(this);
    this.addWebSocketEventHandlers();
  }

  /**
   * initialize state for markdown data
   */
  initStateMarkdown() {
    let pageContent = '';

    const rawText = document.getElementById('raw-text-original');
    if (rawText) {
      pageContent = rawText.innerHTML;
    }
    const markdown = entities.decodeHTML(pageContent);

    this.state.markdown = markdown;
  }

  initStateOthers() {
    const likeButtonElem = document.getElementById('like-button');
    if (likeButtonElem != null) {
      this.state.isLiked = likeButtonElem.dataset.liked === 'true';
    }

    const seenUserListElem = document.getElementById('seen-user-list');
    if (seenUserListElem != null) {
      const userIdsStr = seenUserListElem.dataset.userIds;
      this.state.seenUserIds = userIdsStr.split(',');
    }


    const likerListElem = document.getElementById('liker-list');
    if (likerListElem != null) {
      const userIdsStr = likerListElem.dataset.userIds;
      this.state.likerUserIds = userIdsStr.split(',');
    }
  }

  setLatestRemotePageData(page, user) {
    this.setState({
      remoteRevisionId: page.revision._id,
      revisionIdHackmdSynced: page.revisionHackmdSynced,
      lastUpdateUsername: user.name,
    });
  }


  /**
   * save success handler
   * @param {object} page Page instance
   * @param {Array[Tag]} tags Array of Tag
   */
  updateStateAfterSave(page, tags) {
    // mark that the document is not editing
    this.appContainer.setIsDocSaved(true);

    const { editorMode } = this.appContainer.state;

    // update state of PageContainer
    const newState = {
      pageId: page._id,
      revisionId: page.revision._id,
      revisionCreatedAt: new Date(page.revision.createdAt).getTime() / 1000,
      remoteRevisionId: page.revision._id,
      revisionIdHackmdSynced: page.revisionHackmdSynced,
      hasDraftOnHackmd: page.hasDraftOnHackmd,
      markdown: page.revision.body,
    };
    if (tags != null) {
      newState.tags = tags;
    }
    this.setState(newState);

    // PageEditor component
    const pageEditor = this.appContainer.getComponentInstance('PageEditor');
    if (pageEditor != null) {
      if (editorMode !== 'builtin') {
        pageEditor.updateEditorValue(newState.markdown);
      }
    }
    // PageEditorByHackmd component
    const pageEditorByHackmd = this.appContainer.getComponentInstance('PageEditorByHackmd');
    if (pageEditorByHackmd != null) {
      // reset
      if (editorMode !== 'hackmd') {
        pageEditorByHackmd.reset();
      }
    }

    // hidden input
    $('input[name="revision_id"]').val(newState.revisionId);
  }

  /**
   * Save page
   * @param {string} markdown
   * @param {object} optionsToSave
   * @return {object} { page: Page, tags: Tag[] }
   */
  async save(markdown, optionsToSave = {}) {
    const { editorMode } = this.appContainer.state;

    const { pageId, path } = this.state;
    let { revisionId } = this.state;

    const options = Object.assign({}, optionsToSave);

    if (editorMode === 'hackmd') {
      // set option to sync
      options.isSyncRevisionToHackmd = true;
      revisionId = this.state.revisionIdHackmdSynced;
    }

    let res;
    if (pageId == null) {
      res = await this.createPage(path, markdown, options);
    }
    else {
      res = await this.updatePage(pageId, revisionId, markdown, options);
    }

    this.updateStateAfterSave(res.page, res.tags);
    return res;
  }

  async saveAndReload(optionsToSave) {
    if (optionsToSave == null) {
      const msg = '\'saveAndReload\' requires the \'optionsToSave\' param';
      throw new Error(msg);
    }

    const { editorMode } = this.appContainer.state;
    if (editorMode == null) {
      logger.warn('\'saveAndReload\' requires the \'errorMode\' param');
      return;
    }

    const { pageId, path } = this.state;
    let { revisionId } = this.state;

    const options = Object.assign({}, optionsToSave);

    let markdown;
    if (editorMode === 'hackmd') {
      const pageEditorByHackmd = this.appContainer.getComponentInstance('PageEditorByHackmd');
      markdown = await pageEditorByHackmd.getMarkdown();
      // set option to sync
      options.isSyncRevisionToHackmd = true;
      revisionId = this.state.revisionIdHackmdSynced;
    }
    else {
      const pageEditor = this.appContainer.getComponentInstance('PageEditor');
      markdown = pageEditor.getMarkdown();
    }

    let res;
    if (pageId == null) {
      res = await this.createPage(path, markdown, options);
    }
    else {
      res = await this.updatePage(pageId, revisionId, markdown, options);
    }

    const editorContainer = this.appContainer.getContainer('EditorContainer');
    editorContainer.clearDraft(path);
    window.location.href = path;

    return res;
  }

  async createPage(pagePath, markdown, tmpParams) {
    const websocketContainer = this.appContainer.getContainer('WebsocketContainer');

    // clone
    const params = Object.assign(tmpParams, {
      socketClientId: websocketContainer.getSocketClientId(),
      path: pagePath,
      body: markdown,
    });

    const res = await this.appContainer.apiPost('/pages.create', params);
    if (!res.ok) {
      throw new Error(res.error);
    }
    return { page: res.page, tags: res.tags };
  }

  async updatePage(pageId, revisionId, markdown, tmpParams) {
    const websocketContainer = this.appContainer.getContainer('WebsocketContainer');

    // clone
    const params = Object.assign(tmpParams, {
      socketClientId: websocketContainer.getSocketClientId(),
      page_id: pageId,
      revision_id: revisionId,
      body: markdown,
    });

    const res = await this.appContainer.apiPost('/pages.update', params);
    if (!res.ok) {
      throw new Error(res.error);
    }
    return { page: res.page, tags: res.tags };
  }

  showSuccessToastr() {
    toastr.success(undefined, 'Saved successfully', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '1200',
      extendedTimeOut: '150',
    });
  }

  showErrorToastr(error) {
    toastr.error(error.message, 'Error occured', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  }

  addWebSocketEventHandlers() {
    const pageContainer = this;
    const websocketContainer = this.appContainer.getContainer('WebsocketContainer');
    const socket = websocketContainer.getWebSocket();

    socket.on('page:create', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getSocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:create'`); // eslint-disable-line quotes

      // update PageStatusAlert
      if (data.page.path === pageContainer.state.path) {
        this.setLatestRemotePageData(data.page, data.user);
      }
    });

    socket.on('page:update', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getSocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:update'`); // eslint-disable-line quotes

      if (data.page.path === pageContainer.state.path) {
        // update PageStatusAlert
        pageContainer.setLatestRemotePageData(data.page, data.user);
        // update remote data
        const page = data.page;
        pageContainer.setState({
          remoteRevisionId: page.revision._id,
          revisionIdHackmdSynced: page.revisionHackmdSynced,
          hasDraftOnHackmd: page.hasDraftOnHackmd,
        });
      }
    });

    socket.on('page:delete', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getSocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:delete'`); // eslint-disable-line quotes

      // update PageStatusAlert
      if (data.page.path === pageContainer.state.path) {
        pageContainer.setLatestRemotePageData(data.page, data.user);
      }
    });

    socket.on('page:editingWithHackmd', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getSocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:editingWithHackmd'`); // eslint-disable-line quotes

      if (data.page.path === pageContainer.state.path) {
        pageContainer.setState({ isHackmdDraftUpdatingInRealtime: true });
      }
    });

  }

}
