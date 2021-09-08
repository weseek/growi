import Crowi from '../crowi';

class NortificationService {

  crowi!: any;

  socketIoService!: any;

  notificationEvent!: any;


  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.socketIoService = crowi.socketIoService;
    this.notificationEvent = crowi.event('notification');

    // init
    this.updateNotificationevent();
  }

  updateNotificationevent() {
    this.notificationEvent.on('update', (user) => {
      this.notificationEvent.onUpdate();

      if (this.socketIoService.isInitialized) {
        this.socketIoService.getDefaultSocket().emit('notification updated', { user });
      }
    });
  }

}

module.exports = NortificationService;
