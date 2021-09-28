import { EventEmitter } from 'events';
import loggerFactory from '../../utils/logger';

const logger = loggerFactory('growi:events:activity');


export default class ActivityEvent extends EventEmitter {

  onRemove(action: string, activity: any): void {
    logger.info('onRemove activity event fired');
  }

  onCreate(action: string, activity: any): void {
    logger.info('onCreate activity event fired');
  }

}

module.exports = ActivityEvent;
