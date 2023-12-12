import type { IAttachmentHasId } from '@growi/core';
import mongoose from 'mongoose';

import { getUploader } from '../file-uploader';

export const removeAllAttachments = async(attachments: IAttachmentHasId[]): Promise<void> => {
  const fileUploadService = getUploader();
  const attachmentsCollection = mongoose.connection.collection('attachments');
  const unorderAttachmentsBulkOp = attachmentsCollection.initializeUnorderedBulkOp();

  if (attachments.length === 0) {
    return;
  }

  attachments.forEach((attachment) => {
    unorderAttachmentsBulkOp.find({ _id: attachment._id }).delete();
  });
  await unorderAttachmentsBulkOp.execute();

  await fileUploadService.deleteFiles(attachments);
};
