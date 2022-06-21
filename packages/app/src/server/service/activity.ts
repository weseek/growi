import mongoose from 'mongoose';

import {
  IActivity, SupportedActionType, ActionGroupSize, AllSmallGroupActions, AllMediumGroupActions, AllLargeGroupActions, AllSupportedActionToNotified,
} from '~/interfaces/activity';
import { IPage } from '~/interfaces/page';
import Activity from '~/server/models/activity';

import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';


const logger = loggerFactory('growi:service:ActivityService');

class ActivityService {

  crowi!: Crowi;

  activityEvent: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');

    this.shoudUpdateActivity = this.shoudUpdateActivity.bind(this);

    this.initActivityEventListeners();
  }

  initActivityEventListeners(): void {
    this.activityEvent.on('update', async(activityId: string, parameters, target?: IPage) => {
      let activity: IActivity;
      const shoudUpdate = this.shoudUpdateActivity(parameters.action);

      if (shoudUpdate) {
        try {
          activity = await Activity.updateByParameters(activityId, parameters);
        }
        catch (err) {
          logger.error('Update activity failed', err);
          return;
        }

        this.activityEvent.emit('updated', activity, target);
      }
    });
  }

  shoudUpdateActivity = function(action: SupportedActionType): boolean {
    const configManager = this.crowi.configManager;
    const auditLogActionGroupSize = configManager != null ? configManager.getConfig('crowi', 'app:auditLogActionGroupSize') : ActionGroupSize.Small;

    let shoudUpdate = false;

    switch (auditLogActionGroupSize) {
      case ActionGroupSize.Small:
        shoudUpdate = (AllSmallGroupActions as ReadonlyArray<string>).includes(action);
        break;
      case ActionGroupSize.Medium:
        shoudUpdate = (AllMediumGroupActions as ReadonlyArray<string>).includes(action);
        break;
      case ActionGroupSize.Large:
        shoudUpdate = (AllLargeGroupActions as ReadonlyArray<string>).includes(action);
        break;
    }

    return shoudUpdate || (AllSupportedActionToNotified as ReadonlyArray<string>).includes(action);
  }

  createTtlIndex = async function() {
    const configManager = this.crowi.configManager;
    const activityExpirationSeconds = configManager != null ? configManager.getConfig('crowi', 'app:activityExpirationSeconds') : 2592000;
    const collection = mongoose.connection.collection('activities');

    try {
      const targetField = 'createdAt_1';

      const indexes = await collection.indexes();
      const foundCreatedAt = indexes.find(i => i.name === targetField);

      const isNotSpec = foundCreatedAt?.expireAfterSeconds == null || foundCreatedAt?.expireAfterSeconds !== activityExpirationSeconds;
      const shoudDropIndex = foundCreatedAt != null && isNotSpec;
      const shoudCreateIndex = foundCreatedAt == null || shoudDropIndex;

      if (shoudDropIndex) {
        await collection.dropIndex(targetField);
      }

      if (shoudCreateIndex) {
        await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: activityExpirationSeconds });
      }
    }
    catch (err) {
      logger.error('Failed to create TTL Index', err);
      throw err;
    }
  };

}

module.exports = ActivityService;
