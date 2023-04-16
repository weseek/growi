import { ICondition } from '~/interfaces/questionnaire/condition';
import { IGrowiInfo } from '~/interfaces/questionnaire/growi-info';
import { IQuestionnaireOrder } from '~/interfaces/questionnaire/questionnaire-order';
import { IUserInfo, UserType } from '~/interfaces/questionnaire/user-info';


const checkUserInfo = (condition: ICondition, userInfo: IUserInfo): boolean => {
  const { user: { types, daysSinceCreation } } = condition;

  if (!types.includes(userInfo.type)) {
    return false;
  }

  // Check if "time passed since user creation" is between specified range
  if (userInfo.type !== UserType.guest) {
    const createdAt = userInfo.userCreatedAt;
    const moreThanOrEqualTo = daysSinceCreation?.moreThanOrEqualTo;
    const lessThanOrEqualTo = daysSinceCreation?.lessThanOrEqualTo;
    const currentDate = new Date();

    const isValidLeftThreshold = (() => {
      if (moreThanOrEqualTo == null) {
        return true;
      }
      const leftThreshold = new Date(createdAt.getTime() + 60 * 1000 * 60 * 24 * moreThanOrEqualTo);
      return leftThreshold <= currentDate;
    })();
    const isValidRightThreshold = (() => {
      if (lessThanOrEqualTo == null) {
        return true;
      }
      const rightThreshold = new Date(createdAt.getTime() + 60 * 1000 * 60 * 24 * lessThanOrEqualTo);
      return currentDate <= rightThreshold;
    })();

    return isValidLeftThreshold && isValidRightThreshold;
  }

  return true;
};

const checkGrowiInfo = (condition: ICondition, growiInfo: IGrowiInfo): boolean => {
  const { growi: { types, versionRegExps } } = condition;

  if (!types.includes(growiInfo.type)) {
    return false;
  }

  if (!versionRegExps.some(rs => new RegExp(rs).test(growiInfo.version))) {
    return false;
  }

  return true;
};

export const isShowableCondition = (order: IQuestionnaireOrder, userInfo: IUserInfo, growiInfo: IGrowiInfo): boolean => {
  const { condition } = order;

  if (!checkUserInfo(condition, userInfo)) {
    return false;
  }
  if (!checkGrowiInfo(condition, growiInfo)) {
    return false;
  }

  return true;
};
