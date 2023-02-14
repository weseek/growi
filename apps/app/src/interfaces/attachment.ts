import type { HasObjectId, IAttachment } from '@growi/core';

import type { PaginateResult } from './mongoose-utils';


export type IResAttachmentList = {
  paginateResult: PaginateResult<IAttachment & HasObjectId>
};
