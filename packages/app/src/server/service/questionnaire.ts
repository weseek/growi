import crypto from 'crypto';
import * as os from 'node:os';

import {
  GrowiWikiType, GrowiExternalAuthProviderType, IGrowiInfo, GrowiServiceType, GrowiAttachmentType, GrowiDeploymentType,
} from '~/interfaces/questionnaire/growi-info';
import { StatusType } from '~/interfaces/questionnaire/questionnaire-answer-status';
import { IUserInfo, UserType } from '~/interfaces/questionnaire/user-info';
import { IUserHasId } from '~/interfaces/user';
import QuestionnaireOrder, { QuestionnaireOrderDocument } from '~/server/models/questionnaire/questionnaire-order';

import { ObjectIdLike } from '../interfaces/mongoose-utils';
import QuestionnaireAnswerStatus from '../models/questionnaire/questionnaire-answer-status';
import { isShowableCondition } from '../util/questionnaire/condition';

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

    const currentUsersCount = await User.countDocuments();
    const currentActiveUsersCount = await User.countActiveUsers();

    const wikiMode = this.crowi.configManager.getConfig('crowi', 'security:wikiMode');
    const wikiType = wikiMode === 'private' ? GrowiWikiType.closed : GrowiWikiType.open;

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
