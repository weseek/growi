import crypto from 'crypto';
import * as os from 'node:os';

import type { IUserHasId } from '@growi/core';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
// eslint-disable-next-line import/no-named-as-default
import Config from '~/server/models/config';
import { aclService } from '~/server/service/acl';
import loggerFactory from '~/utils/logger';

import {
  GrowiWikiType, GrowiExternalAuthProviderType, IGrowiInfo, GrowiServiceType, GrowiAttachmentType, GrowiDeploymentType,
} from '../../interfaces/growi-info';
import { StatusType } from '../../interfaces/questionnaire-answer-status';
import { type IUserInfo, UserType } from '../../interfaces/user-info';
import QuestionnaireAnswerStatus from '../models/questionnaire-answer-status';
import QuestionnaireOrder, { QuestionnaireOrderDocument } from '../models/questionnaire-order';
import { isShowableCondition } from '../util/condition';


const logger = loggerFactory('growi:service:questionnaire');

class QuestionnaireService {

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.crowi = crowi;
  }

  async getGrowiInfo(): Promise<IGrowiInfo> {
    const User = this.crowi.model('User');

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
    const installedAt = appInstalledConfig != null && appInstalledConfig.createdAt != null ? appInstalledConfig.createdAt : installedAtByOldestUser;

    const currentUsersCount = await User.countDocuments();
    const currentActiveUsersCount = await User.countActiveUsers();

    const isGuestAllowedToRead = aclService.isGuestAllowedToRead();
    const wikiType = isGuestAllowedToRead ? GrowiWikiType.open : GrowiWikiType.closed;

    const activeExternalAccountTypes: GrowiExternalAuthProviderType[] = Object.values(GrowiExternalAuthProviderType).filter((type) => {
      return this.crowi.configManager.getConfig('crowi', `security:passport-${type}:isEnabled`);
    });

    const typeStr = this.crowi.configManager.getConfig('crowi', 'app:serviceType');
    const type = Object.values(GrowiServiceType).includes(typeStr) ? typeStr : null;

    const attachmentTypeStr = this.crowi.configManager.getConfig('crowi', 'app:fileUploadType');
    const attachmentType = Object.values(GrowiAttachmentType).includes(attachmentTypeStr) ? attachmentTypeStr : null;

    const deploymentTypeStr = this.crowi.configManager.getConfig('crowi', 'app:deploymentType');
    const deploymentType = Object.values(GrowiDeploymentType).includes(deploymentTypeStr) ? deploymentTypeStr : null;

    return {
      version: this.crowi.version,
      osInfo: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        totalmem: os.totalmem(),
      },
      appSiteUrl: this.crowi.configManager.getConfig('crowi', 'questionnaire:isAppSiteUrlHashed') ? null : appSiteUrl,
      appSiteUrlHashed,
      installedAt,
      installedAtByOldestUser,
      type,
      currentUsersCount,
      currentActiveUsersCount,
      wikiType,
      attachmentType,
      activeExternalAccountTypes,
      deploymentType,
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

  async getQuestionnaireOrdersToShow(userInfo: IUserInfo, growiInfo: IGrowiInfo, userId: ObjectIdLike | null): Promise<QuestionnaireOrderDocument[]> {
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
