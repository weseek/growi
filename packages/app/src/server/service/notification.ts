import Crowi from '../crowi';

class NortificationService {

  crowi!: any;

  socketIoService!: any;

  commentEvent!: any;


  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.socketIoService = crowi.socketIoService;
    this.commentEvent = crowi.event('comment');

    // init
    this.updateNotificationevent();
  }

  updateNotificationevent() {
    this.commentEvent.on('update', (user) => {
      this.commentEvent.onUpdate();

      if (this.socketIoService.isInitialized) {
        this.socketIoService.getDefaultSocket().emit('comment updated', { user });
      }
    });
  }

}

module.exports = NortificationService;
