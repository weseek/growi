import { pagePathUtils } from '@growi/core';
import * as entities from 'entities';
import * as toastr from 'toastr';
import { Container } from 'unstated';


import { EditorMode } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import {
  DetachCodeBlockInterceptor,
  RestoreCodeBlockInterceptor,
} from '../../services/renderer/interceptor/detach-code-blocks';
import {
  DrawioInterceptor,
} from '../../services/renderer/interceptor/drawio-interceptor';
import { toastError } from '../util/apiNotification';
import { apiPost } from '../util/apiv1-client';

const { isTrashPage } = pagePathUtils;

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
      isEmpty: mainContent.getAttribute('data-page-is-empty'),

      deletedAt: mainContent.getAttribute('data-page-deleted-at') || null,

      isUserPage: JSON.parse(mainContent.getAttribute('data-page-user')) != null,
      isTrashPage: isTrashPage(path),
      isNotCreatable: JSON.parse(mainContent.getAttribute('data-page-is-not-creatable')),
      isPageExist: mainContent.getAttribute('data-page-id') != null,

      pageUser: JSON.parse(mainContent.getAttribute('data-page-user')),
      tags: null,
      hasChildren: JSON.parse(mainContent.getAttribute('data-page-has-children')),
      templateTagData: mainContent.getAttribute('data-template-tags') || null,
      shareLinksNumber: mainContent.getAttribute('data-share-links-number'),
      shareLinkId: JSON.parse(mainContent.getAttribute('data-share-link-id') || null),

      // latest(on remote) information
      remoteRevisionId: revisionId,
      remoteRevisionBody: null,
      remoteRevisionUpdateAt: null,
      revisionIdHackmdSynced: mainContent.getAttribute('data-page-revision-id-hackmd-synced') || null,
      lastUpdateUsername: mainContent.getAttribute('data-page-last-update-username') || null,
      deleteUsername: mainContent.getAttribute('data-page-delete-username') || null,
      pageIdOnHackmd: mainContent.getAttribute('data-page-id-on-hackmd') || null,
      hasDraftOnHackmd: !!mainContent.getAttribute('data-page-has-draft-on-hackmd'),
      isHackmdDraftUpdatingInRealtime: false,
      isConflictDiffModalOpen: false,
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
      this.state.lastUpdateUser = JSON.parse(mainContent.getAttribute('data-page-revision-author'));
    }
    catch (e) {
      logger.warn('The data of \'data-page-revision-author\' is invalid', e);
    }

    const { interceptorManager } = window;
    interceptorManager.addInterceptor(new DetachCodeBlockInterceptor(), 10); // process as soon as possible
    interceptorManager.addInterceptor(new DrawioInterceptor(), 20);
    interceptorManager.addInterceptor(new RestoreCodeBlockInterceptor(), 900); // process as late as possible

    this.initStateMarkdown();

    this.save = this.save.bind(this);

    this.emitJoinPageRoomRequest = this.emitJoinPageRoomRequest.bind(this);
    this.emitJoinPageRoomRequest();

    this.addWebSocketEventHandlers = this.addWebSocketEventHandlers.bind(this);
    this.addWebSocketEventHandlers();

    const unlinkPageButton = document.getElementById('unlink-page-button');
    if (unlinkPageButton != null) {
      unlinkPageButton.addEventListener('click', async() => {
        try {
          const res = await apiPost('/pages.unlink', { path });
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
   * [Already SWRized]
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

  setLatestRemotePageData(s2cMessagePageUpdated) {
    const newState = {
      remoteRevisionId: s2cMessagePageUpdated.revisionId,
      remoteRevisionBody: s2cMessagePageUpdated.revisionBody,
      remoteRevisionUpdateAt: s2cMessagePageUpdated.revisionUpdateAt,
      revisionIdHackmdSynced: s2cMessagePageUpdated.revisionIdHackmdSynced,
      // TODO // TODO remove lastUpdateUsername and refactor parts that lastUpdateUsername is used
      lastUpdateUsername: s2cMessagePageUpdated.lastUpdateUsername,
      lastUpdateUser: s2cMessagePageUpdated.remoteLastUpdateUser,
    };

    if (s2cMessagePageUpdated.hasDraftOnHackmd != null) {
      newState.hasDraftOnHackmd = s2cMessagePageUpdated.hasDraftOnHackmd;
    }

    this.setState(newState);
  }

  /**
   * save success handler
   * @param {object} page Page instance
   * @param {Array[Tag]} tags Array of Tag
   * @param {object} revision Revision instance
   */
  updateStateAfterSave(page, tags, revision, editorMode) {
    // update state of PageContainer
    // const newState = {
    //   pageId: page._id,
    //   revisionId: revision._id,
    //   revisionCreatedAt: new Date(revision.createdAt).getTime() / 1000,
    //   remoteRevisionId: revision._id,
    //   revisionAuthor: revision.author,
    //   revisionIdHackmdSynced: page.revisionHackmdSynced,
    //   hasDraftOnHackmd: page.hasDraftOnHackmd,
    //   markdown: revision.body,
    //   createdAt: page.createdAt,
    //   updatedAt: page.updatedAt,
    // };
    // if (tags != null) {
    //   newState.tags = tags;
    // }
    // this.setState(newState);

    // PageEditorByHackmd component
    // const pageEditorByHackmd = this.appContainer.getComponentInstance('PageEditorByHackmd');
    // if (pageEditorByHackmd != null) {
    //   // reset
    //   if (editorMode !== EditorMode.HackMD) {
    //     pageEditorByHackmd.reset();
    //   }
    // }
  }

  /**
   * update page meta data
   * @param {object} page Page instance
   * @param {object} revision Revision instance
   * @param {String[]} tags Array of Tag
   */
  updatePageMetaData(page, revision, tags) {

    const newState = {
      revisionId: revision._id,
      revisionCreatedAt: new Date(revision.createdAt).getTime() / 1000,
      remoteRevisionId: revision._id,
      revisionAuthor: revision.author,
      revisionIdHackmdSynced: page.revisionHackmdSynced,
      hasDraftOnHackmd: page.hasDraftOnHackmd,
      updatedAt: page.updatedAt,
    };
    if (tags != null) {
      newState.tags = tags;
    }

    this.setState(newState);

  }

  /**
   * Save page
   * @param {string} markdown
   * @param {object} optionsToSave
   * @return {object} { page: Page, tags: Tag[] }
   */
  async save(markdown, editorMode, optionsToSave = {}) {
    const { pageId, path } = this.state;
    let { revisionId } = this.state;
    const options = Object.assign({}, optionsToSave);

    if (editorMode === EditorMode.HackMD) {
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

    this.updateStateAfterSave(res.page, res.tags, res.revision, editorMode);
    return res;
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

  // request to server so the client to join a room for each page
  emitJoinPageRoomRequest() {
    const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');
    const socket = socketIoContainer.getSocket();
    socket.emit('join:page', { socketId: socket.id, pageId: this.state.pageId });
  }

  addWebSocketEventHandlers() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const pageContainer = this;
    const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');
    const socket = socketIoContainer.getSocket();

    socket.on('page:create', (data) => {
      logger.debug({ obj: data }, `websocket on 'page:create'`); // eslint-disable-line quotes

      // update remote page data
      const { s2cMessagePageUpdated } = data;
      if (s2cMessagePageUpdated.pageId === pageContainer.state.pageId) {
        pageContainer.setLatestRemotePageData(s2cMessagePageUpdated);
      }
    });

    socket.on('page:update', (data) => {
      logger.debug({ obj: data }, `websocket on 'page:update'`); // eslint-disable-line quotes

      // update remote page data
      const { s2cMessagePageUpdated } = data;
      if (s2cMessagePageUpdated.pageId === pageContainer.state.pageId) {
        pageContainer.setLatestRemotePageData(s2cMessagePageUpdated);
      }
    });

    socket.on('page:delete', (data) => {
      logger.debug({ obj: data }, `websocket on 'page:delete'`); // eslint-disable-line quotes

      // update remote page data
      const { s2cMessagePageUpdated } = data;
      if (s2cMessagePageUpdated.pageId === pageContainer.state.pageId) {
        pageContainer.setLatestRemotePageData(s2cMessagePageUpdated);
      }
    });

    socket.on('page:editingWithHackmd', (data) => {
      logger.debug({ obj: data }, `websocket on 'page:editingWithHackmd'`); // eslint-disable-line quotes

      // update isHackmdDraftUpdatingInRealtime
      const { s2cMessagePageUpdated } = data;
      if (s2cMessagePageUpdated.pageId === pageContainer.state.pageId) {
        pageContainer.setState({ isHackmdDraftUpdatingInRealtime: true });
      }
    });

  }

  /* TODO GW-325 */
  retrieveMyBookmarkList() {
  }

  async resolveConflict(markdown, editorMode) {

    const { pageId, remoteRevisionId, path } = this.state;
    const editorContainer = this.appContainer.getContainer('EditorContainer');
    const options = editorContainer.getCurrentOptionsToSave();
    const optionsToSave = Object.assign({}, options);

    const res = await this.updatePage(pageId, remoteRevisionId, markdown, optionsToSave);

    editorContainer.clearDraft(path);
    this.updateStateAfterSave(res.page, res.tags, res.revision, editorMode);

    // Update PageEditor component
    if (editorMode !== EditorMode.Editor) {
      // eslint-disable-next-line no-undef
      globalEmitter.emit('updateEditorValue', markdown);
    }

    editorContainer.setState({ tags: res.tags });

    return res;
  }

}
