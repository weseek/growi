import type { IGrowiAdditionalInfo, IGrowiInfo } from '@growi/core/dist/interfaces';

import type { AttachmentMethodType } from '~/interfaces/attachment';
import type { IExternalAuthProviderType } from '~/interfaces/external-auth-provider';


export type IGrowiAppAdditionalInfo = IGrowiAdditionalInfo & {
  attachmentType: AttachmentMethodType
  activeExternalAccountTypes?: IExternalAuthProviderType[]
  currentPagesCount: number
}

// legacy properties (extracted from additionalInfo for growi-questionnaire)
// see: https://gitlab.weseek.co.jp/tech/growi/growi-questionnaire
export type IGrowiAppInfoLegacy = Omit<IGrowiInfo<IGrowiAppAdditionalInfo>, 'additionalInfo'>
  & IGrowiAppAdditionalInfo
  & {
    appSiteUrlHashed: string,
  };
