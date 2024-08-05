import type {
  IPage, IUser, IUserHasId, Ref,
} from '@growi/core';

import { type IAnnouncement, type ParamsForAnnouncement } from '~/interfaces/announcement';

import { apiv3Post } from '../../../../client/util/apiv3-client';
import { toastError } from '../../../../client/util/toastr';

export const createAnnouncement = async(params: ParamsForAnnouncement): Promise<void> => {

  try {
    await apiv3Post('/announcement/doAnnouncement', params);
  }
  catch (err) {
    toastError(err);
  }

};
