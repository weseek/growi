import { getModelSafely } from '@growi/core';
import mongoose from 'mongoose';

import { IActivity } from '~/interfaces/activity';
import { IPage } from '~/interfaces/page';
import Activity from '~/server/models/activity';

import loggerFactory from '../../utils/logger';
import Crowi from '../crowi';


const logger = loggerFactory('growi:service:ActivityService');

type ParameterType = Omit<IActivity, 'createdAt'>

class ActivityService {

  crowi!: Crowi;

  activityEvent: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');

    this.updateByParameters = this.updateByParameters.bind(this);

    this.createTtlIndex();
    this.initActivityEventListeners();
  }

  initActivityEventListeners(): void {
    this.activityEvent.on('update', async(activityId: string, parameters: ParameterType, target?: IPage) => {

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

  private createTtlIndex = async function() {
    const configManager = this.crowi.configManager;
    const activityExpirationSeconds = configManager != null ? configManager.getConfig('crowi', 'app:activityExpirationSeconds') : 7776000;
    const collection = mongoose.connection.collection('activities');

    try {
      const targetField = 'createdAt_1';
      const indexes = await collection.getIndexes();
      const isExistTargetField = Object.keys(indexes).includes(targetField);
      if (isExistTargetField) {
        await collection.dropIndex(targetField);
      }
    }
    catch (err) {
      logger.error('Failed to drop target index', err);
      return;
    }

    try {
      // Set retention period only if activityExpirationSeconds is not null
      await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: activityExpirationSeconds });
    }
    catch (err) {
      logger.error('Failed to create TTL indexes', err);
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

  updateByParameters = async function(activityId: string, parameters: ParameterType): Promise<IActivity> {
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
