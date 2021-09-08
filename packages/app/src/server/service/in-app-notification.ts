import Crowi from '../crowi';

class InAppNotificationService {

  crowi!: any;

  socketIoService!: any;

  commentEvent!: any;


  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.socketIoService = crowi.socketIoService;
    this.commentEvent = crowi.event('comment');

    // init
    this.updateCommentEvent();
  }

  updateCommentEvent(): void {
    this.commentEvent.on('update', (user) => {
      this.commentEvent.onUpdate();

      if (this.socketIoService.isInitialized) {
        this.socketIoService.getDefaultSocket().emit('comment updated', { user });
      }
    });
  }

}

module.exports = InAppNotificationService;
