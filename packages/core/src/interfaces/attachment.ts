import type { Ref } from './common';
import type { IPage } from './page';
import type { IUser } from './user';

export type IAttachment = {
  page?: Ref<IPage>,
  creator?: Ref<IUser>,
  createdAt: Date,
  fileSize: number,
  // virtual property
  filePathProxied: string,
  fileFormat: string,
  downloadPathProxied: string,
  originalName: string,
};
