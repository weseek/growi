import { getModelSafely } from '@growi/core';
import mongoose from 'mongoose';

import { IActivity } from '~/interfaces/activity';
import { IPage } from '~/interfaces/page';
import Activity from '~/server/models/activity';

import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';


const logger = loggerFactory('growi:service:ActivityService');

type UpdateActivityParameterType = Omit<IActivity, 'user' | 'createdAt' | 'ip' | 'endpoint'>

class ActivityService {

  crowi!: Crowi;

  activityEvent: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');

    this.updateByParameters = this.updateByParameters.bind(this);

    this.initActivityEventListeners();
  }

  initActivityEventListeners(): void {
    this.activityEvent.on('update', async(activityId: string, parameters: UpdateActivityParameterType, target?: IPage) => {

      // update activity
      let activity: IActivity;
      try {
        activity = await this.updateByParameters(activityId, parameters);
      }
      catch (err) {
        logger.error('Update activity failed', err);
        return;
      }

      this.activityEvent.emit('updated', activity, target);
    });
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


  /**
     * @param {object} parameters
     * @return {Promise}
     */
  createByParameters = function(parameters) {
    const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);

    return Activity.create(parameters);
  };

  updateByParameters = async function(activityId: string, parameters: UpdateActivityParameterType): Promise<IActivity> {
    const activity = await Activity.findOneAndUpdate({ _id: activityId }, parameters, { new: true }) as unknown as IActivity;

    return activity;
  };

  /**
   * @param {User} user
   * @return {Promise}
   */
  findByUser = function(user) {
    return this.find({ user }).sort({ createdAt: -1 }).exec();
  };

}

module.exports = ActivityService;
