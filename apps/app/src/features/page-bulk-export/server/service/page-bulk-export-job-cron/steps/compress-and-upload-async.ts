import { Writable, pipeline } from 'stream';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import gc from 'expose-gc/function';

import { getBufferToFixedSizeTransform } from "~/server/util/stream";
import { Attachment, IAttachmentDocument } from "~/server/models/attachment";
import { AttachmentType, FilePathOnStoragePrefix } from "~/server/interfaces/attachment";
import { FileUploader } from "~/server/service/file-uploader";
import { IMultipartUploader } from "~/server/service/file-uploader/multipart-uploader";
import { PageBulkExportJobStatus } from "~/features/page-bulk-export/interfaces/page-bulk-export";
import { SupportedAction } from "~/interfaces/activity";
import loggerFactory from "~/utils/logger";

import { PageBulkExportJobDocument } from "../../../models/page-bulk-export-job";
import { IPageBulkExportJobCronService } from "..";

const logger = loggerFactory('growi:service:page-bulk-export-job-cron:compress-and-upload-async');

/**
 * Execute a pipeline that reads the page files from the temporal fs directory, compresses them, and uploads to the cloud storage
 */
export async function compressAndUploadAsync(this: IPageBulkExportJobCronService, user, pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
  const pageArchiver = setUpPageArchiver();
  const bufferToPartSizeTransform = getBufferToFixedSizeTransform(this.maxPartSize);

  if (pageBulkExportJob.revisionListHash == null) throw new Error('revisionListHash is not set');
  const originalName = `${pageBulkExportJob.revisionListHash}.${this.compressExtension}`;
  const attachment = Attachment.createWithoutSave(null, user, originalName, this.compressExtension, 0, AttachmentType.PAGE_BULK_EXPORT);
  const uploadKey = `${FilePathOnStoragePrefix.pageBulkExport}/${attachment.fileName}`;

  const fileUploadService: FileUploader = this.crowi.fileUploadService;
  // if the process of uploading was interrupted, delete and start from the start
  if (pageBulkExportJob.uploadKey != null && pageBulkExportJob.uploadId != null) {
    await fileUploadService.abortPreviousMultipartUpload(pageBulkExportJob.uploadKey, pageBulkExportJob.uploadId);
  }

  // init multipart upload
  const multipartUploader: IMultipartUploader = fileUploadService.createMultipartUploader(uploadKey, this.maxPartSize);
  await multipartUploader.initUpload();
  pageBulkExportJob.uploadKey = uploadKey;
  pageBulkExportJob.uploadId = multipartUploader.uploadId;
  await pageBulkExportJob.save();

  const multipartUploadWritable = getMultipartUploadWritable.bind(this)(multipartUploader, pageBulkExportJob, attachment);

  pipeline(pageArchiver, bufferToPartSizeTransform, multipartUploadWritable, (err) => {
    this.handlePipelineError(err, pageBulkExportJob);
  });
  pageArchiver.directory(this.getTmpOutputDir(pageBulkExportJob), false);
  pageArchiver.finalize();
}

function setUpPageArchiver(): Archiver {
  const pageArchiver = archiver('tar', {
    gzip: true,
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  pageArchiver.on('warning', (err) => {
    if (err.code === 'ENOENT') logger.error(err);
    else throw err;
  });

  return pageArchiver;
}

function getMultipartUploadWritable(
    this: IPageBulkExportJobCronService,
    multipartUploader: IMultipartUploader,
    pageBulkExportJob: PageBulkExportJobDocument,
    attachment: IAttachmentDocument,
): Writable {
  let partNumber = 1;

  return new Writable({
    write: async(part: Buffer, encoding, callback) => {
      try {
        await multipartUploader.uploadPart(part, partNumber);
        partNumber += 1;
        // First aid to prevent unexplained memory leaks
        logger.info('global.gc() invoked.');
        gc();
      }
      catch (err) {
        await multipartUploader.abortUpload();
        callback(err);
        return;
      }
      callback();
    },
    final: async(callback) => {
      try {
        await multipartUploader.completeUpload();

        const fileSize = await multipartUploader.getUploadedFileSize();
        attachment.fileSize = fileSize;
        await attachment.save();

        pageBulkExportJob.completedAt = new Date();
        pageBulkExportJob.attachment = attachment._id;
        pageBulkExportJob.status = PageBulkExportJobStatus.completed;
        await pageBulkExportJob.save();

        await this.notifyExportResultAndCleanUp(SupportedAction.ACTION_PAGE_BULK_EXPORT_COMPLETED, pageBulkExportJob);
      }
      catch (err) {
        callback(err);
        return;
      }
      callback();
    },
  });
}
