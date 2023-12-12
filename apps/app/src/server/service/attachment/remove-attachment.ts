import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import loggerFactory from '~/utils/logger';

import { Attachment } from '../../models';
import { getUploader } from '../file-uploader';

const logger = loggerFactory('growi:service:AttachmentService');

export const removeAttachment = async(attachmentId: ObjectIdLike): Promise<void> => {
  const fileUploadService = getUploader();
  const attachment = await Attachment.findById(attachmentId);

  if (attachment == null) {
    logger.log('attachment is not found.');
    return;
  }

  await fileUploadService.deleteFile(attachment);
  await attachment.remove();
};
