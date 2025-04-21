import crypto from 'crypto';

import type { IUserHasId } from '@growi/core';
import type { IGrowiInfo } from '@growi/core/dist/interfaces';

import type Crowi from '~/server/crowi';
import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import loggerFactory from '~/utils/logger';

import type { IGrowiAppAdditionalInfo } from '../../interfaces/growi-app-info';
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
  constructor(crowi: Crowi) {
    this.crowi = crowi;
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
    userInfo: IUserInfo,
    growiInfo: IGrowiInfo<IGrowiAppAdditionalInfo>,
    userId: ObjectIdLike | null,
  ): Promise<QuestionnaireOrderDocument[]> {
    const currentDate = new Date();

    let questionnaireOrders = await QuestionnaireOrder.find({
      showUntil: {
        $gte: currentDate,
      },
    });

    if (userId != null) {
      const statuses = await QuestionnaireAnswerStatus.find({ userId, questionnaireOrderId: { $in: questionnaireOrders.map((d) => d._id) } });

      questionnaireOrders = questionnaireOrders.filter((order) => {
        const status = statuses.find((s) => s.questionnaireOrderId.toString() === order._id.toString());

        return !status || status?.status === StatusType.not_answered;
      });
    }

    return questionnaireOrders.filter((order) => {
      return isShowableCondition(order, userInfo, growiInfo);
    });
  }
}

export default QuestionnaireService;
