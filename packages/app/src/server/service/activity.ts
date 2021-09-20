import loggerFactory from '../../utils/logger';

import { ActivityDocument } from '../models/activity';

const InAppNotificationService = require('./in-app-notification');


const logger = loggerFactory('growi:service:ActivityService');

class ActivityService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

}

module.exports = ActivityService;
