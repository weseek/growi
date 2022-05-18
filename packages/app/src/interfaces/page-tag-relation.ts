import { RefUsingLegacyHasObjectId, Ref } from './common';
import { IPage } from './page';
import { ITag } from './tag';

export type IPageTagRelation<ID = string> = {
  _id: ID
  relatedPage: RefUsingLegacyHasObjectId<IPage>,
  relatedTag: Ref<ITag>,
  isPageTrashed: boolean,
}
