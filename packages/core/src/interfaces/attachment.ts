import { Ref } from './common';
import { IPage } from './page';
import { IUser } from './user';

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
