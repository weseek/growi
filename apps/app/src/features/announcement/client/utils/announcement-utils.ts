import { apiv3Post } from '../../../../client/util/apiv3-client';
import { toastError } from '../../../../client/util/toastr';
import { type ParamsForAnnouncement } from '../../interfaces/announcement';

export const createAnnouncement = async(params: ParamsForAnnouncement): Promise<void> => {
  await apiv3Post('/announcement/do-announcement', params);
};
