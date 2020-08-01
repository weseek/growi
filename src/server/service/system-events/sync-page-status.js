const logger = require('@alias/logger')('growi:service:system-events:SyncPageStatusService');

class SyncPageStatusService {

  constructor(crowi, configPubsubService, socketIoService) {
    this.crowi = crowi;
    this.configPubsubService = configPubsubService;
    this.socketIoService = socketIoService;

    this.emitter = crowi.events.page;

    this.init();
  }

  init() {
    const { socketIoService } = this;
    const { pageService } = this.crowi;

    // register events
    this.emitter.on('create', (page, user, socketClientId) => {
      logger.debug('\'create\' event emitted.');

      page = pageService.serializeToObj(page); // eslint-disable-line no-param-reassign
      socketIoService.getDefaultSocket().emit('page:create', { page, user, socketClientId });
    });
    this.emitter.on('update', (page, user, socketClientId) => {
      logger.debug('\'update\' event emitted.');

      page = pageService.serializeToObj(page); // eslint-disable-line no-param-reassign
      socketIoService.getDefaultSocket().emit('page:update', { page, user, socketClientId });
    });
    this.emitter.on('delete', (page, user, socketClientId) => {
      logger.debug('\'delete\' event emitted.');

      page = pageService.serializeToObj(page); // eslint-disable-line no-param-reassign
      socketIoService.getDefaultSocket().emit('page:delete', { page, user, socketClientId });
    });
  }

}

module.exports = SyncPageStatusService;
