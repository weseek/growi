import type { IAttachment } from '@growi/core';

import type { PaginateResult } from './mongoose-utils';


export type IResAttachmentList = {
  data: {
    paginateResult: PaginateResult<IAttachment>
  }
};
