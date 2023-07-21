import type { IAttachmentHasId } from '@growi/core/dist/interfaces';

import type { PaginateResult } from './mongoose-utils';


export type IResAttachmentList = {
  paginateResult: PaginateResult<IAttachmentHasId>
};
