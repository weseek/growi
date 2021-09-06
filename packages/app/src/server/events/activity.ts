import { EventEmitter } from 'events';

export default class ActivityEvent extends EventEmitter {

  public crowi

  constructor(crowi) {
    super();
    this.crowi = crowi;
  }

  onRemove(activity) {}

}
