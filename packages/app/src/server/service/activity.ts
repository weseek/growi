import { differenceWith } from 'lodash';
import mongoose from 'mongoose';

import {
  IActivity, SupportedActionType, ActionGroupSize, AllSmallGroupActions, AllMediumGroupActions, AllLargeGroupActions, AllSupportedActionToNotified,
} from '~/interfaces/activity';
import { IPage } from '~/interfaces/page';
import Activity from '~/server/models/activity';

import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';


const logger = loggerFactory('growi:service:ActivityService');

const parseActionString = (actionsString: SupportedActionType): SupportedActionType[] => {
  if (actionsString == null) {
    return [];
  }

  return (actionsString as string).split(',').map(value => value.trim()) as SupportedActionType[];
};

class ActivityService {

  crowi!: Crowi;

  activityEvent: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');

    this.getAvailableActions = this.getAvailableActions.bind(this);
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

  getAvailableActions = function(): SupportedActionType[] {
    const auditLogActionGroupSize = this.crowi.configManager.getConfig('crowi', 'app:auditLogActionGroupSize') || ActionGroupSize.Small;
    const auditLogAdditonalActions = this.crowi.configManager.getConfig('crowi', 'app:auditLogAdditonalActions');
    const auditLogExcludeActions = this.crowi.configManager.getConfig('crowi', 'app:auditLogExcludeActions');

    let additonalActions: SupportedActionType[] = [];
    if (auditLogAdditonalActions != null) {
      additonalActions = parseActionString(auditLogAdditonalActions);
    }

    let excludeActions: SupportedActionType[] = [];
    if (auditLogExcludeActions != null) {
      excludeActions = parseActionString(auditLogExcludeActions);
    }

    const availableActions: SupportedActionType[] = [...AllSupportedActionToNotified, ...additonalActions];

    switch (auditLogActionGroupSize) {
      case ActionGroupSize.Small:
        availableActions.push(...AllSmallGroupActions);
        break;
      case ActionGroupSize.Medium:
        availableActions.push(...AllMediumGroupActions);
        break;
      case ActionGroupSize.Large:
        availableActions.push(...AllLargeGroupActions);
        break;
    }

    // availableActions - excludeActions
    return differenceWith(Array.from(new Set(availableActions)), excludeActions);
  }

  shoudUpdateActivity = function(action: SupportedActionType): boolean {
    return this.getAvailableActions().includes(action);
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
