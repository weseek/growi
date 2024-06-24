import type {
  IPage, IUser, IUserHasId, Ref,
} from '@growi/core';

import { type IAnnouncement, type ParamsForAnnouncement } from '~/interfaces/announcement';

import { apiv3Post } from './apiv3-client';
import { toastError } from './toastr';

export const createAnnouncement = async(params: ParamsForAnnouncement): Promise<void> => {

  try {
    await apiv3Post('/announcement', params);
  }
  catch (err) {
    toastError(err);
  }

};
