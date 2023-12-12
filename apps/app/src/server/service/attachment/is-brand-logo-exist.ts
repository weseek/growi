import { AttachmentType } from '~/server/interfaces/attachment';

import { Attachment } from '../../models';

export const isBrandLogoExist = async(): Promise<boolean> => {
  const query = { attachmentType: AttachmentType.BRAND_LOGO };
  const count = await Attachment.countDocuments(query);

  return count >= 1;
};
