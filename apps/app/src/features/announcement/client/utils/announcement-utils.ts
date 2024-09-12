import { apiv3Post } from '../../../../client/util/apiv3-client';
import { toastError } from '../../../../client/util/toastr';
import { type ParamsForAnnouncement } from '../../interfaces/announcement';

export const createAnnouncement = async(params: ParamsForAnnouncement): Promise<void> => {

  try {
    await apiv3Post('/announcement/doAnnouncement', params);
  }
  catch (err) {
    toastError(err);
  }

};
