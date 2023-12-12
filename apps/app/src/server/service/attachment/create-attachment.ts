import fs from 'fs';

import type { IUserHasId } from '@growi/core';

import loggerFactory from '~/utils/logger';

import { AttachmentType } from '../../interfaces/attachment';
import { Attachment, type IAttachmentDocument } from '../../models';
import { getUploader } from '../file-uploader';

const logger = loggerFactory('growi:service:AttachmentService');

// TODO: make it type safe
export const createAttachment = async(file: any, user: IUserHasId, pageId = null, attachmentType: AttachmentType): Promise<IAttachmentDocument> => {
  const fileUploadService = getUploader();

  // check limit
  const res = await fileUploadService.checkLimit(file.size);
  if (!res.isUploadable) {
    throw new Error(res.errorMessage);
  }

  const fileStream = fs.createReadStream(file.path, {
    flags: 'r',
    encoding: undefined,
    fd: undefined,
    mode: 0o666,
    autoClose: true,
  });

  // create an Attachment document and upload file
  let attachment: IAttachmentDocument;
  try {
    attachment = Attachment.createWithoutSave(pageId, user, fileStream, file.originalname, file.mimetype, file.size, attachmentType);
    await fileUploadService.uploadAttachment(fileStream, attachment);
    await attachment.save();
  }
  catch (err) {
    // delete temporary file
    fs.unlink(file.path, (err) => { if (err) { logger.error('Error while deleting tmp file.') } });
    throw err;
  }

  return attachment;
};
