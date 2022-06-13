import events from 'events';

import { PageDocument } from '../models/page';


const debug = require('debug')('growi:events:page');

class PageEvent extends events.EventEmitter {

  crowi!: any

  constructor(crowi: any) {
    super();
    this.crowi = crowi;
  }

  onCreate(page: PageDocument, user: any): void {
    debug('onCreate event fired');
  }

  onUpdate(page: PageDocument, user: any): void {
    debug('onUpdate event fired');
  }

  onCreateMany(pages: PageDocument[], user: any): void {
    debug('onCreateMany event fired');
  }

  onAddSeenUsers(pages: PageDocument[], user: any): void {
    debug('onAddSeenUsers event fired');
  }

}

module.exports = PageEvent;
