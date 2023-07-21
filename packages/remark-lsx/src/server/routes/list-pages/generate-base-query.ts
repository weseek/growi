import type { IPageHasId, IUser } from '@growi/core/dist/interfaces';
import { model } from 'mongoose';
import type { Document, Query } from 'mongoose';

export type PageQuery = Query<IPageHasId[], Document>;

export type PageQueryBuilder = {
  query: PageQuery,
  addConditionToListOnlyDescendants: (pagePath: string) => PageQueryBuilder,
  addConditionToFilteringByViewerForList: (builder: PageQueryBuilder, user: IUser) => PageQueryBuilder,
};

export const generateBaseQuery = async(pagePath: string, user: IUser): Promise<PageQueryBuilder> => {
  const Page = model<IPageHasId>('Page');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PageAny = Page as any;

  const baseQuery = Page.find();

  const builder: PageQueryBuilder = new PageAny.PageQueryBuilder(baseQuery);
  builder.addConditionToListOnlyDescendants(pagePath);

  return PageAny.addConditionToFilteringByViewerForList(builder, user);
};
