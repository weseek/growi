import type { IPageHasId } from '@growi/core/dist/interfaces';

export type PageNode = {
  pagePath: string,
  children: PageNode[],
  page?: IPageHasId,
}
