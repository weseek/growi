import crypto from 'crypto';
import * as os from 'node:os';

import { IGrowiInfo } from '~/interfaces/questionnaire/growi-info';
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

    return {
      version: this.crowi.version,
      osInfo: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        totalmem: os.totalmem(),
      },
      appSiteUrl, // TODO: set only if allowed (see: https://dev.growi.org/6385911e1632aa30f4dae6a4#mdcont-%E5%8C%BF%E5%90%8D%E5%8C%96%E3%81%8C%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%97%E3%83%AD%E3%83%91%E3%83%86%E3%82%A3)
      appSiteUrlHashed,
      type: this.crowi.configManager.getConfig('crowi', 'app:serviceType'),
      currentUsersCount,
      currentActiveUsersCount,
      wikiType: 'open', // TODO: set actual value
      attachmentType: this.crowi.configManager.getConfig('crowi', 'app:fileUploadType'),
      activeExternalAccountTypes: undefined, // TODO: set actual value
      deploymentType: this.crowi.configManager.getConfig('crowi', 'app:deploymentType'),
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
