

class NortificationService {

  crowi!: any;

  notificationEvent!: any;


  constructor(crowi) {
    this.crowi = crowi;
    this.notificationEvent = crowi.event('notification');

    // init
    // comments
    this.notificationEvent.on('update', this.notificationEvent.onUpdateComment);
  }

}

module.exports = NortificationService;
