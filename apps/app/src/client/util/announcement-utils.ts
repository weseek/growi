import type { IUser, IUserHasId } from '@growi/core';

import { type IAnnouncement } from '~/interfaces/announcement';

import { apiv3Post, apiv3Put } from './apiv3-client';
import { toastError } from './toastr';


export const createAnnouncement = async(announcement: IAnnouncement, sender: IUserHasId, pageId: string, receivers: IUserHasId[]): Promise<void> => {

  try {
    await apiv3Post('/announcement', {
      announcement, sender, pageId, receivers,
    });
    console.log('ok');
  }
  catch (err) {
    toastError(err);
    console.log('failed');
  }

};
