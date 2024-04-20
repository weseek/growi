import type { IUser, IUserHasId } from '@growi/core';

import { type IAnnouncement } from '~/interfaces/announcement';

import { apiv3Post, apiv3Put } from './apiv3-client';
import { toastError } from './toastr';


export const createAnnouncement = async(announcement: IAnnouncement, sender: IUserHasId, pageId: string, receivers: IUserHasId[]): Promise<void> => {

  try {
    console.log('ok');
    await apiv3Post('/announcement', {
      announcement, sender, pageId, receivers,
    });
  }
  catch (err) {
    console.log('failed');
    toastError(err);
  }

};
