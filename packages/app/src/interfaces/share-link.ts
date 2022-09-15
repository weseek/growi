import { IPageHasId, HasObjectId } from '@growi/core';

// Todo: specify more detailed Type
export type IResShareLinkList = {
  shareLinksResult: any[],
};

export type IShareLink = {
  relatedPage: IPageHasId,
  createdAt: Date,
  expiredAt?: Date,
  description: string,
  isExpired: () => void,
};

export type IShareLinkHasId = IShareLink & HasObjectId;
