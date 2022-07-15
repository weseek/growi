import { Ref } from './common';
import { IPage } from './page';
import { IUser } from './user';

export type IAttachment = {
  page?: Ref<IPage>,
  creator?: Ref<IUser>,

  // virtual property
  filePathProxied: string,
};
