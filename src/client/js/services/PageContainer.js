import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import * as entities from 'entities';
import * as toastr from 'toastr';
import { toastError } from '../util/apiNotification';

import {
  DetachCodeBlockInterceptor,
  RestoreCodeBlockInterceptor,
} from '../util/interceptor/detach-code-blocks';

import {
  DrawioInterceptor,
} from '../util/interceptor/drawio-interceptor';

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
    const path = decodeURI(mainContent.getAttribute('data-path'));

    this.state = {
      // local page data
      markdown: null, // will be initialized after initStateMarkdown()
      pageId: mainContent.getAttribute('data-page-id'),
      revisionId,
      revisionCreatedAt: +mainContent.getAttribute('data-page-revision-created'),
      path,
      tocHtml: '',
      isLiked: false,
      isBookmarked: false,
      seenUsers: [],
      countOfSeenUsers: mainContent.getAttribute('data-page-count-of-seen-users'),

      likerUsers: [],
      sumOfLikers: 0,
      sumOfBookmarks: 0,
      createdAt: mainContent.getAttribute('data-page-created-at'),
      updatedAt: mainContent.getAttribute('data-page-updated-at'),
      isForbidden: JSON.parse(mainContent.getAttribute('data-page-is-forbidden')),
      isDeleted:  JSON.parse(mainContent.getAttribute('data-page-is-deleted')),
      isDeletable:  JSON.parse(mainContent.getAttribute('data-page-is-deletable')),
      isNotCreatable: JSON.parse(mainContent.getAttribute('data-page-is-not-creatable')),
      isAbleToDeleteCompletely:  JSON.parse(mainContent.getAttribute('data-page-is-able-to-delete-completely')),
      pageUser: JSON.parse(mainContent.getAttribute('data-page-user')),
      tags: null,
      hasChildren: JSON.parse(mainContent.getAttribute('data-page-has-children')),
      templateTagData: mainContent.getAttribute('data-template-tags') || null,
      shareLinksNumber:  mainContent.getAttribute('data-share-links-number'),
      shareLinkId: JSON.parse(mainContent.getAttribute('data-share-link-id') || null),

      // latest(on remote) information
      remoteRevisionId: revisionId,
      revisionIdHackmdSynced: mainContent.getAttribute('data-page-revision-id-hackmd-synced') || null,
      lastUpdateUsername: mainContent.getAttribute('data-page-last-update-username') || null,
      pageIdOnHackmd: mainContent.getAttribute('data-page-id-on-hackmd') || null,
      hasDraftOnHackmd: !!mainContent.getAttribute('data-page-has-draft-on-hackmd'),
      isHackmdDraftUpdatingInRealtime: false,
    };

    // parse creator, lastUpdateUser and revisionAuthor
    try {
      this.state.creator = JSON.parse(mainContent.getAttribute('data-page-creator'));
    }
    catch (e) {
      logger.warn('The data of \'data-page-creator\' is invalid', e);
    }
    try {
      this.state.revisionAuthor = JSON.parse(mainContent.getAttribute('data-page-revision-author'));
    }
    catch (e) {
      logger.warn('The data of \'data-page-revision-author\' is invalid', e);
    }

    const { interceptorManager } = this.appContainer;
    interceptorManager.addInterceptor(new DetachCodeBlockInterceptor(appContainer), 10); // process as soon as possible
    interceptorManager.addInterceptor(new DrawioInterceptor(appContainer), 20);
    interceptorManager.addInterceptor(new RestoreCodeBlockInterceptor(appContainer), 900); // process as late as possible

    this.retrieveSeenUsers();
    this.initStateMarkdown();
    this.initStateOthers();

    this.setTocHtml = this.setTocHtml.bind(this);
    this.save = this.save.bind(this);
    this.checkAndUpdateImageUrlCached = this.checkAndUpdateImageUrlCached.bind(this);
    this.addWebSocketEventHandlers = this.addWebSocketEventHandlers.bind(this);
    this.addWebSocketEventHandlers();

    const unlinkPageButton = document.getElementById('unlink-page-button');
    if (unlinkPageButton != null) {
      unlinkPageButton.addEventListener('click', async() => {
        try {
          const res = await this.appContainer.apiPost('/pages.unlink', { path });
          window.location.href = encodeURI(`${res.path}?unlinked=true`);
        }
        catch (err) {
          toastError(err);
        }
      });
    }

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PageContainer';
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

  async retrieveSeenUsers() {
    const { users } = await this.appContainer.apiGet('/users.list', { user_ids: this.state.seenUserIds });

    this.setState({ seenUsers: users });
    this.checkAndUpdateImageUrlCached(users);
  }

  async initStateOthers() {

    this.retrieveLikeInfo();
    this.retrieveBookmarkInfo();
    this.checkAndUpdateImageUrlCached(this.state.likerUsers);
  }

  async retrieveLikeInfo() {
    const like = await this.appContainer.apiv3Get('/page/like-info', { _id: this.state.pageId });
    this.setState({
      sumOfLikers: like.data.sumOfLikers,
      likerUsers: like.data.users.liker,
      isLiked: like.data.isLiked,
    });
  }

  async toggleLike() {
    const bool = !this.state.isLiked;
    await this.appContainer.apiv3Put('/page/likes', { pageId: this.state.pageId, bool });
    this.setState({ isLiked: bool });

    return this.retrieveLikeInfo();
  }

  async retrieveBookmarkInfo() {
    const response = await this.appContainer.apiv3Get('/bookmarks', { pageId: this.state.pageId });
    if (response.data.bookmarks != null) {
      this.setState({ isBookmarked: true });
    }
    else {
      this.setState({ isBookmarked: false });
    }
    this.setState({ sumOfBookmarks: response.data.sumOfBookmarks });
  }

  async toggleBookmark() {
    const bool = !this.state.isBookmarked;
    await this.appContainer.apiv3Put('/bookmarks', { pageId: this.state.pageId, bool });
    return this.retrieveBookmarkInfo();
  }

  async checkAndUpdateImageUrlCached(users) {
    const noImageCacheUsers = users.filter((user) => { return user.imageUrlCached == null });
    if (noImageCacheUsers.length === 0) {
      return;
    }

    const noImageCacheUserIds = noImageCacheUsers.map((user) => { return user.id });
    try {
      await this.appContainer.apiv3Put('/users/update.imageUrlCache', { userIds: noImageCacheUserIds });
    }
    catch (err) {
      // Error alert doesn't apear, because user don't need to notice this error.
      logger.error(err);
    }
  }

  get navigationContainer() {
    return this.appContainer.getContainer('NavigationContainer');
  }

  setLatestRemotePageData(page, user) {
    this.setState({
      remoteRevisionId: page.revision._id,
      revisionIdHackmdSynced: page.revisionHackmdSynced,
      lastUpdateUsername: user.name,
    });
  }

  setTocHtml(tocHtml) {
    if (this.state.tocHtml !== tocHtml) {
      this.setState({ tocHtml });
    }
  }

  /**
   * save success handler
   * @param {object} page Page instance
   * @param {Array[Tag]} tags Array of Tag
   */
  updateStateAfterSave(page, tags) {
    const { editorMode } = this.navigationContainer.state;

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
    const { editorMode } = this.navigationContainer.state;

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

    const { editorMode } = this.navigationContainer.state;
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
    const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');

    // clone
    const params = Object.assign(tmpParams, {
      socketClientId: socketIoContainer.getSocketClientId(),
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
    const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');

    // clone
    const params = Object.assign(tmpParams, {
      socketClientId: socketIoContainer.getSocketClientId(),
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

  deletePage(isRecursively, isCompletely) {
    const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');

    // control flag
    const completely = isCompletely ? true : null;
    const recursively = isRecursively ? true : null;

    return this.appContainer.apiPost('/pages.remove', {
      recursively,
      completely,
      page_id: this.state.pageId,
      revision_id: this.state.revisionId,
      socketClientId: socketIoContainer.getSocketClientId(),
    });

  }

  revertRemove(isRecursively) {
    const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');

    // control flag
    const recursively = isRecursively ? true : null;

    return this.appContainer.apiPost('/pages.revertRemove', {
      recursively,
      page_id: this.state.pageId,
      socketClientId: socketIoContainer.getSocketClientId(),
    });
  }

  rename(pageNameInput, isRenameRecursively, isRenameRedirect, isRenameMetadata) {
    const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');
    const isRecursively = isRenameRecursively ? true : null;
    const isRedirect = isRenameRedirect ? true : null;
    const isRemain = isRenameMetadata ? true : null;

    return this.appContainer.apiPost('/pages.rename', {
      recursively: isRecursively,
      page_id: this.state.pageId,
      revision_id: this.state.revisionId,
      new_path: pageNameInput,
      create_redirect: isRedirect,
      remain_metadata: isRemain,
      socketClientId: socketIoContainer.getSocketClientId(),
    });
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
    const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');
    const socket = socketIoContainer.getSocket();

    socket.on('page:create', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === socketIoContainer.getSocketClientId()) {
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
      if (data.socketClientId != null && data.socketClientId === socketIoContainer.getSocketClientId()) {
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
      if (data.socketClientId != null && data.socketClientId === socketIoContainer.getSocketClientId()) {
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
      if (data.socketClientId != null && data.socketClientId === socketIoContainer.getSocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:editingWithHackmd'`); // eslint-disable-line quotes

      if (data.page.path === pageContainer.state.path) {
        pageContainer.setState({ isHackmdDraftUpdatingInRealtime: true });
      }
    });

  }

  /* TODO GW-325 */
  retrieveMyBookmarkList() {
  }

}
