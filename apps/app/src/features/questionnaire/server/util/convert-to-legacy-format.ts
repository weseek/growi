import assert from 'assert';
import crypto from 'crypto';

import type { IGrowiAppInfoLegacy } from '../../interfaces/growi-app-info';

type IHasGrowiAppInfoLegacy<T> = T & {
  growiInfo: IGrowiAppInfoLegacy;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLegacy<T extends { growiInfo: any }>(data: T): data is IHasGrowiAppInfoLegacy<T> {
  return !('additionalInfo' in data.growiInfo);
}

export function getSiteUrlHashed(siteUrl: string): string {
  const hasher = crypto.createHash('sha256');
  hasher.update(siteUrl);
  return hasher.digest('hex');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToLegacyFormat<T extends { growiInfo: any }>(questionnaireAnswer: T, isAppSiteUrlHashed = false): IHasGrowiAppInfoLegacy<T> {
  if (isLegacy(questionnaireAnswer)) {
    return questionnaireAnswer;
  }

  const { additionalInfo, appSiteUrl, ...rest } = questionnaireAnswer.growiInfo;
  assert(additionalInfo != null);

  return {
    ...questionnaireAnswer,
    growiInfo: {
      appSiteUrl: isAppSiteUrlHashed ? undefined : appSiteUrl,
      appSiteUrlHashed: getSiteUrlHashed(appSiteUrl),
      ...rest,
      ...additionalInfo,
    },
  };
}
