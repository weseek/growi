import { IPage, IUser } from '@growi/core';
import { model } from 'mongoose';
import type { Document, Query } from 'mongoose';

export type PageQueryBuilder = {
  query: Query<IPage, Document>,
  addConditionToListOnlyDescendants: (pagePath: string) => PageQueryBuilder,
  addConditionToFilteringByViewerForList: (builder: PageQueryBuilder, user: IUser) => PageQueryBuilder,
};

export const generateBaseQuery = (pagePath: string, user: IUser): PageQueryBuilder => {
  const Page = model<IPage>('Page');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PageAny = Page as any;

  const baseQuery = Page.find();

  const builder: PageQueryBuilder = new PageAny.PageQueryBuilder(baseQuery);
  builder.addConditionToListOnlyDescendants(pagePath);

  return PageAny.addConditionToFilteringByViewerForList(builder, user);
};
