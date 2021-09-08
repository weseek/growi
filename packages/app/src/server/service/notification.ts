import Crowi from '../crowi';

class NortificationService {

  crowi!: any;

  notificationEvent!: any;


  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.notificationEvent = crowi.event('notification');

    // init
    this.notificationEvent.on('update', this.notificationEvent.onUpdate);
  }

}

module.exports = NortificationService;
