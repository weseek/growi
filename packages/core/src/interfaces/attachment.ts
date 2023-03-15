import type { Ref } from './common';
import type { IPage } from './page';
import type { IUser } from './user';

export type IAttachment = {
  page?: Ref<IPage>,
  creator?: Ref<IUser>,

  // virtual property
  filePathProxied: string,

  fileFormat: string,
  downloadPathProxied: string,
  originalName: string,
};
