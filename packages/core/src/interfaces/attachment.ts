import type { Ref } from './common';
import { HasObjectId } from './has-object-id';
import type { IPage } from './page';
import type { IUser } from './user';

export type IAttachment = {
  page?: Ref<IPage>,
  creator?: Ref<IUser>,
  fileName: string,
  fileFormat: string,
  fileSize: number,
  originalName: string,
  temporaryUrlCached?: string,
  temporaryUrlExpiredAt?: Date,

  createdAt: Date,

  // virtual property
  filePathProxied: string,
  downloadPathProxied: string,
};

export type IAttachmentHasId = IAttachment & HasObjectId;
