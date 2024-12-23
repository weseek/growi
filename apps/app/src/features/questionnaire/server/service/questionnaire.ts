import crypto from 'crypto';
import * as os from 'node:os';


import type { IUserHasId } from '@growi/core';
import type { IGrowiInfo, IUser } from '@growi/core/dist/interfaces';
import { GrowiWikiType } from '@growi/core/dist/interfaces';
import type { Model } from 'mongoose';
import mongoose from 'mongoose';

import { IExternalAuthProviderType } from '~/interfaces/external-auth-provider';
import type Crowi from '~/server/crowi';
import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import { Config } from '~/server/models/config';
import { aclService } from '~/server/service/acl';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import type { IGrowiAppAdditionalInfo } from '../../interfaces/growi-app-additional-info';
import { StatusType } from '../../interfaces/questionnaire-answer-status';
import { type IUserInfo, UserType } from '../../interfaces/user-info';
import QuestionnaireAnswerStatus from '../models/questionnaire-answer-status';
import type { QuestionnaireOrderDocument } from '../models/questionnaire-order';
import QuestionnaireOrder from '../models/questionnaire-order';
import { isShowableCondition } from '../util/condition';


const logger = loggerFactory('growi:service:questionnaire');

class QuestionnaireService {

  crowi: Crowi;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.crowi = crowi;
  }

  async getGrowiInfo(): Promise<IGrowiInfo<IGrowiAppAdditionalInfo>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const User = mongoose.model<IUser, Model<IUser>>('User');

    const appSiteUrl = this.crowi.appService.getSiteUrl();
    const hasher = crypto.createHash('sha256');
    hasher.update(appSiteUrl);
    const appSiteUrlHashed = hasher.digest('hex');

    // Get the oldest user who probably installed this GROWI.
    // https://mongoosejs.com/docs/6.x/docs/api.html#model_Model-findOne
    // https://stackoverflow.com/questions/13443069/mongoose-findone-with-sorting
    const user = await User.findOne({ createdAt: { $ne: null } }).sort({ createdAt: 1 });

    const installedAtByOldestUser = user ? user.createdAt : null;

    const appInstalledConfig = await Config.findOne({ key: 'app:installed' });
    const oldestConfig = await Config.findOne().sort({ createdAt: 1 });

    // oldestConfig must not be null because there is at least one config
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installedAt = installedAtByOldestUser ?? appInstalledConfig?.createdAt ?? oldestConfig!.createdAt ?? null;

    const currentUsersCount = await User.countDocuments();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentActiveUsersCount = await (User as any).countActiveUsers();

    const isGuestAllowedToRead = aclService.isGuestAllowedToRead();
    const wikiType = isGuestAllowedToRead ? GrowiWikiType.open : GrowiWikiType.closed;

    const activeExternalAccountTypes: IExternalAuthProviderType[] = Object.values(IExternalAuthProviderType).filter((type) => {
      return configManager.getConfig(`security:passport-${type}:isEnabled`);
    });

    return {
      version: this.crowi.version,
      osInfo: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        totalmem: os.totalmem(),
      },
      appSiteUrl: configManager.getConfig('questionnaire:isAppSiteUrlHashed') ? undefined : appSiteUrl,
      appSiteUrlHashed,
      type: configManager.getConfig('app:serviceType'),
      wikiType,
      deploymentType: configManager.getConfig('app:deploymentType'),
      additionalInfo: {
        installedAt,
        installedAtByOldestUser,
        currentUsersCount,
        currentActiveUsersCount,
        attachmentType: configManager.getConfig('app:fileUploadType'),
        activeExternalAccountTypes,
      },
    };
  }

  getUserInfo(user: IUserHasId | null, appSiteUrlHashed: string): IUserInfo {
    if (user != null) {
      const hasher = crypto.createHmac('sha256', appSiteUrlHashed);
      hasher.update(user._id.toString());

      return {
        userIdHash: hasher.digest('hex'),
        type: user.admin ? UserType.admin : UserType.general,
        userCreatedAt: user.createdAt,
      };
    }

    return { type: UserType.guest };
  }

  async getQuestionnaireOrdersToShow(
      userInfo: IUserInfo, growiInfo: IGrowiInfo<IGrowiAppAdditionalInfo>, userId: ObjectIdLike | null,
  ): Promise<QuestionnaireOrderDocument[]> {
    const currentDate = new Date();

    let questionnaireOrders = await QuestionnaireOrder.find({
      showUntil: {
        $gte: currentDate,
      },
    });

    if (userId != null) {
      const statuses = await QuestionnaireAnswerStatus.find({ userId, questionnaireOrderId: { $in: questionnaireOrders.map(d => d._id) } });

      questionnaireOrders = questionnaireOrders.filter((order) => {
        const status = statuses.find(s => s.questionnaireOrderId.toString() === order._id.toString());

        return !status || status?.status === StatusType.not_answered;
      });
    }

    return questionnaireOrders
      .filter((order) => {
        return isShowableCondition(order, userInfo, growiInfo);
      });
  }

}

export default QuestionnaireService;
