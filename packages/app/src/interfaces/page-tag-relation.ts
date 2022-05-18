import { IPage } from './page';
import { ITag } from './tag';

export type IPageTagRelation<ID = string> = {
  _id: ID
  relatedPage: IPage,
  relatedTag: ITag,
  isPageTrashed: boolean,
}
