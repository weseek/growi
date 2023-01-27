import crypto from 'crypto';
import * as os from 'node:os';

import { IGrowiInfo } from '~/interfaces/questionnaire/growi-info';
import { IUserInfo, UserType } from '~/interfaces/questionnaire/user-info';
import { IUserHasId } from '~/interfaces/user';
import QuestionnaireOrder, { QuestionnaireOrderDocument } from '~/server/models/questionnaire/questionnaire-order';

import { shouldShowQuestionnaire } from '../util/questionnaire/condition';

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
    const attachmentType = this.crowi.configManager.getConfig('crowi', 'app:fileUploadType');

    return {
      version: this.crowi.version,
      osInfo: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        totalmem: os.totalmem(),
      },
      appSiteUrl, // TODO: set only if allowed
      appSiteUrlHashed,
      type: 'cloud', // TODO: set actual value
      currentUsersCount,
      currentActiveUsersCount,
      wikiType: 'open', // TODO: set actual value
      attachmentType,
      activeExternalAccountTypes: undefined, // TODO: set actual value
      deploymentType: undefined, // TODO: set actual value
    };
  }

  getUserInfo(user: IUserHasId, appSiteUrlHashed: string): IUserInfo {
    if (user) {
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

  async getQuestionnaireOrdersToShow(userInfo, growiInfo): Promise<QuestionnaireOrderDocument[]> {
    const currentDate = new Date();

    const questionnaireOrders = await QuestionnaireOrder.find({
      showUntil: {
        $gte: currentDate,
      },
    });

    return questionnaireOrders.filter((order) => {
      return shouldShowQuestionnaire(order.condition, userInfo, growiInfo);
    });
  }

}

export default QuestionnaireService;
