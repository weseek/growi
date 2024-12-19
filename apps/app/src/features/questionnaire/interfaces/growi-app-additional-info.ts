import type { IGrowiAdditionalInfo } from '@growi/core/dist/interfaces';

import type { AttachmentMethodType } from '~/interfaces/attachment';
import type { IExternalAuthProviderType } from '~/interfaces/external-auth-provider';

export type IGrowiAppAdditionalInfo = IGrowiAdditionalInfo & {
  attachmentType: AttachmentMethodType
  activeExternalAccountTypes?: IExternalAuthProviderType[]
}
