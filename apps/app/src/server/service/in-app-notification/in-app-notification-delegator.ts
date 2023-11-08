import type { IUser, IPage } from '@growi/core';

import { SupportedTargetModel } from '~/interfaces/activity';
import { IInAppNotification } from '~/interfaces/in-app-notification';


export const getDelegator = <T>(targetModel: string) => {
  switch (targetModel) {
    case SupportedTargetModel.MODEL_USER:
      return インスタンス;
    case SupportedTargetModel.MODEL_PAGE:
      return インスタンス;
  }
};
