import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:system-events:SyncPageStatusService');

const S2sMessage = require('../../models/vo/s2s-message');
const S2sMessageHandlable = require('../s2s-messaging/handlable');

/**
 * This service notify page status
 *  to clients who are connecting to this server
 *  and also notify to clients connecting to other GROWI servers
 *
 * Sequence:
 *  1. A client A1 connecting to GROWI server A updates a page
 *  2. GROWI server A notify the information
 *    2.1 -- to client A2, A3, ... with SocketIoService
 *    2.2 -- to other GROWI servers with S2sMessagingService
 *  3. GROWI server B, C, ... relay the information to clients B1, B2, .. C1, C2, ... with SocketIoService
 *
 */
class SyncPageStatusService extends S2sMessageHandlable {

  constructor(crowi, s2sMessagingService, socketIoService) {
    super();

    this.crowi = crowi;
    this.s2sMessagingService = s2sMessagingService;
    this.socketIoService = socketIoService;

    this.emitter = crowi.events.page;

    this.initSystemEventListeners();
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage) {
    const { eventName } = s2sMessage;
    if (eventName !== 'pageStatusUpdated') {
      return false;
    }

    return true;
  }

  /**
   * @inheritdoc
   */
  async handleS2sMessage(s2sMessage) {
    const { socketIoEventName, page, user } = s2sMessage;
    const { socketIoService } = this;

    // emit the updated information to clients
    if (socketIoService.isInitialized) {
      socketIoService.getDefaultSocket().emit(socketIoEventName, { page, user });
    }
  }

  async publishToOtherServers(socketIoEventName, page, user) {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('pageStatusUpdated', { socketIoEventName, page, user });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
      }
    }
  }

  initSystemEventListeners() {
    const { socketIoService } = this;
    const { pageService } = this.crowi;

    // register events
    this.emitter.on('create', (page, user, socketClientId) => {
      logger.debug('\'create\' event emitted.');

      page = pageService.serializeToObj(page); // eslint-disable-line no-param-reassign
      socketIoService.getDefaultSocket().emit('page:create', { page, user, socketClientId });

      this.publishToOtherServers('page:create', page, user);
    });
    this.emitter.on('update', (page, user, socketClientId) => {
      logger.debug('\'update\' event emitted.');

      page = pageService.serializeToObj(page); // eslint-disable-line no-param-reassign
      socketIoService.getDefaultSocket().emit('page:update', { page, user, socketClientId });

      this.publishToOtherServers('page:update', page, user);
    });
    this.emitter.on('delete', (page, user, socketClientId) => {
      logger.debug('\'delete\' event emitted.');

      page = pageService.serializeToObj(page); // eslint-disable-line no-param-reassign
      socketIoService.getDefaultSocket().emit('page:delete', { page, user, socketClientId });

      this.publishToOtherServers('page:delete', page, user);
    });
    this.emitter.on('saveOnHackmd', (page) => {
      socketIoService.getDefaultSocket().emit('page:editingWithHackmd', { page });
      this.publishToOtherServers('page:editingWithHackmd', page);
    });
  }

}

module.exports = SyncPageStatusService;
