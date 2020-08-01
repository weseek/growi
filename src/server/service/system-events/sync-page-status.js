const logger = require('@alias/logger')('growi:service:system-events:SyncPageStatusService');

const ConfigPubsubMessage = require('../../models/vo/config-pubsub-message');
const ConfigPubsubMessageHandlable = require('../config-pubsub/handlable');

class SyncPageStatusService extends ConfigPubsubMessageHandlable {

  constructor(crowi, configPubsub, socketIoService) {
    super();

    this.crowi = crowi;
    this.configPubsub = configPubsub;
    this.socketIoService = socketIoService;

    this.emitter = crowi.events.page;

    this.initSystemEventListeners();
  }

  /**
   * @inheritdoc
   */
  shouldHandleConfigPubsubMessage(configPubsubMessage) {
    const { eventName } = configPubsubMessage;
    if (eventName !== 'pageStatusUpdated') {
      return false;
    }

    return true;
  }

  /**
   * @inheritdoc
   */
  async handleConfigPubsubMessage(configPubsubMessage) {
    const { socketIoEventName, page, user } = configPubsubMessage;
    const { socketIoService } = this;

    // emit the updated information to clients
    socketIoService.getDefaultSocket().emit(socketIoEventName, { page, user });
  }

  async publishToOtherServers(socketIoEventName, page, user) {
    const { configPubsub } = this;

    if (configPubsub != null) {
      const configPubsubMessage = new ConfigPubsubMessage('pageStatusUpdated', { socketIoEventName, page, user });

      try {
        await configPubsub.publish(configPubsubMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with configPubsub: ', e.message);
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
