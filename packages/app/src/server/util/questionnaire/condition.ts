import { ICondition } from '~/interfaces/questionnaire/condition';
import { IGrowiInfo } from '~/interfaces/questionnaire/growi-info';
import { IQuestionnaireOrder } from '~/interfaces/questionnaire/questionnaire-order';
import { IUserInfo } from '~/interfaces/questionnaire/user-info';


const checkUserInfo = (condition: ICondition, userInfo: IUserInfo): boolean => {
  const { user: { types } } = condition;

  return types.includes(userInfo.type);
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
