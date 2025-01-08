import assert from 'assert';

import type { IGrowiAppInfoLegacy } from '../../interfaces/growi-app-info';


type IHasGrowiAppInfoLegacy<T> = T & {
  growiInfo: IGrowiAppInfoLegacy;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLegacy<T extends { growiInfo: any }>(data: T): data is IHasGrowiAppInfoLegacy<T> {
  return !('additionalInfo' in data.growiInfo);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToLegacyFormat<T extends { growiInfo: any }>(questionnaireAnswer: T): IHasGrowiAppInfoLegacy<T> {
  if (isLegacy(questionnaireAnswer)) {
    return questionnaireAnswer;
  }

  const { additionalInfo, ...rest } = questionnaireAnswer.growiInfo;
  assert(additionalInfo != null);

  return {
    ...questionnaireAnswer,
    growiInfo: {
      ...rest,
      ...additionalInfo,
    },
  };
}