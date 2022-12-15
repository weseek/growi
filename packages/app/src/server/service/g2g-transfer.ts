import { createReadStream, ReadStream } from 'fs';
import { basename } from 'path';
import { Readable } from 'stream';

// eslint-disable-next-line no-restricted-imports
import rawAxios from 'axios';
import FormData from 'form-data';
import { Types as MongooseTypes } from 'mongoose';

import { G2G_PROGRESS_STATUS } from '~/interfaces/g2g-transfer';
import TransferKeyModel from '~/server/models/transfer-key';
import { createBatchStream } from '~/server/util/batch-stream';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';
import { TransferKey } from '~/utils/vo/transfer-key';

import { G2GTransferError, G2GTransferErrorCode } from '../models/vo/g2g-transfer-error';

const logger = loggerFactory('growi:service:g2g-transfer');

export const X_GROWI_TRANSFER_KEY_HEADER_NAME = 'x-growi-transfer-key';

export const uploadConfigKeys = [
  'app:fileUploadType',
  'app:useOnlyEnvVarForFileUploadType',
  'aws:referenceFileWithRelayMode',
  'aws:lifetimeSecForTemporaryUrl',
  'gcs:apiKeyJsonPath',
  'gcs:bucket',
  'gcs:uploadNamespace',
  'gcs:referenceFileWithRelayMode',
  'gcs:useOnlyEnvVarsForSomeOptions',
];

/**
 * Data used for comparing to/from GROWI information
 */
export type IDataGROWIInfo = {
  version: string
  userUpperLimit: number | null // Handle null as Infinity
  fileUploadDisabled: boolean;
  fileUploadTotalLimit: number | null // Handle null as Infinity
  attachmentInfo: {
    type: string;
    writable: boolean;
    bucket?: string;
    customEndpoint?: string; // for S3
    uploadNamespace?: string; // for GCS
  };
}

/**
 * File metadata in storage
 * TODO: mv this to "./file-uploader/uploader"
 */
interface FileMeta {
  name: string;
  size: number;
}

/**
 * Return type for {@link Pusher.getTransferability}
 */
type IGetTransferabilityReturn = { canTransfer: true; } | { canTransfer: false; reason: string; };

interface Pusher {
  /**
   * Send to-growi a request to get growi info
   * @param {TransferKey} tk Transfer key
   */
  askGROWIInfo(tk: TransferKey): Promise<IDataGROWIInfo>
  /**
   * Check if transfering is proceedable
   * @param {IDataGROWIInfo} fromGROWIInfo
   */
  getTransferability(fromGROWIInfo: IDataGROWIInfo): Promise<IGetTransferabilityReturn>
  /**
   * List files in the storage
   * @param {TransferKey} tk Transfer key
   */
  listFilesInStorage(tk: TransferKey): Promise<FileMeta[]>
  /**
   * Transfer all Attachment data to destination GROWI
   * @param {TransferKey} tk Transfer key
   */
  transferAttachments(tk: TransferKey): Promise<void>
  /**
   * Start transfer data between GROWIs
   * @param {TransferKey} tk TransferKey object
   * @param {string[]} collections Collection name string array
   * @param {any} optionsMap Options map
   */
  startTransfer(
    tk: TransferKey,
    user: any,
    collections: string[],
    optionsMap: any,
  ): Promise<void>
}

interface Receiver {
  /**
   * Check if key is not expired
   * @throws {import('../models/vo/g2g-transfer-error').G2GTransferError}
   * @param {string} key Transfer key
   */
  validateTransferKey(key: string): Promise<void>
  /**
   * Check if key is not expired
   * @throws {import('../models/vo/g2g-transfer-error').G2GTransferError}
   */
  answerGROWIInfo(): Promise<IDataGROWIInfo>
  /**
   * DO NOT USE TransferKeyModel.create() directly, instead, use this method to create a TransferKey document.
   * This method receives appSiteUrlOrigin to create a TransferKey document and returns generated transfer key string.
   * UUID is the same value as the created document's _id.
   * @param {string} appSiteUrlOrigin GROWI app site URL origin
   * @returns {string} Transfer key string (e.g. http://localhost:3000__grw_internal_tranferkey__<uuid>)
   */
  createTransferKey(appSiteUrlOrigin: string): Promise<string>
  /**
   * Receive transfer request and import data.
   * @param {Readable} zippedGROWIDataStream
   * @returns {void}
   */
  receive(zippedGROWIDataStream: Readable): Promise<void>
}

const generateAxiosRequestConfigWithTransferKey = (tk: TransferKey, additionalHeaders: {[key: string]: string} = {}) => {
  const { appSiteUrlOrigin, key } = tk;

  return {
    baseURL: appSiteUrlOrigin,
    headers: {
      ...additionalHeaders,
      [X_GROWI_TRANSFER_KEY_HEADER_NAME]: key,
    },
    maxBodyLength: Infinity,
  };
};

export class G2GTransferPusherService implements Pusher {

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi: any) {
    this.crowi = crowi;
  }

  public async askGROWIInfo(tk: TransferKey): Promise<IDataGROWIInfo> {
    try {
      const { data: { growiInfo } } = await axios.get('/_api/v3/g2g-transfer/growi-info', generateAxiosRequestConfigWithTransferKey(tk));
      return growiInfo;
    }
    catch (err) {
      logger.error(err);
      throw new G2GTransferError('Failed to retrieve growi info.', G2GTransferErrorCode.FAILED_TO_RETRIEVE_GROWI_INFO);
    }
  }

  /**
   * Returns whether g2g transfer is possible and reason for failure
   * @param toGROWIInfo to-growi info
   * @returns Whether g2g transfer is possible and reason for failure
   */
  public async getTransferability(toGROWIInfo: IDataGROWIInfo): Promise<IGetTransferabilityReturn> {
    const { fileUploadService } = this.crowi;

    const version = this.crowi.version;
    if (version !== toGROWIInfo.version) {
      return {
        canTransfer: false,
        // TODO: i18n for reason
        reason: `Growi versions mismatch. This Growi: ${version} / new Growi: ${toGROWIInfo.version}.`,
      };
    }

    const activeUserCount = await this.crowi.model('User').countActiveUsers();
    if ((toGROWIInfo.userUpperLimit ?? Infinity) < activeUserCount) {
      return {
        canTransfer: false,
        // TODO: i18n for reason
        reason: `The number of active users (${activeUserCount} users) exceeds the limit of new Growi (to up ${toGROWIInfo.userUpperLimit} users).`,
      };
    }

    if (toGROWIInfo.fileUploadDisabled) {
      return {
        canTransfer: false,
        // TODO: i18n for reason
        reason: 'File upload is disabled in new Growi.',
      };
    }

    if (!toGROWIInfo.attachmentInfo.writable) {
      return {
        canTransfer: false,
        // TODO: i18n for reason
        reason: 'The storage of new Growi is not writable.',
      };
    }

    const totalFileSize = await fileUploadService.getTotalFileSize();
    if ((toGROWIInfo.fileUploadTotalLimit ?? Infinity) < totalFileSize) {
      return {
        canTransfer: false,
        // TODO: i18n for reason
        // eslint-disable-next-line max-len
        reason: `Total file size exceeds file upload limit of new Growi. Requires ${totalFileSize.toLocaleString()} bytes, but got ${(toGROWIInfo.fileUploadTotalLimit ?? Infinity).toLocaleString()} bytes.`,
      };
    }

    return { canTransfer: true };
  }

  public async listFilesInStorage(tk: TransferKey): Promise<FileMeta[]> {
    try {
      const { data: { files } } = await axios.get<{ files: FileMeta[] }>('/_api/v3/g2g-transfer/files', generateAxiosRequestConfigWithTransferKey(tk));
      return files;
    }
    catch (err) {
      logger.error(err);
      throw new G2GTransferError('Failed to retrieve file metadata', G2GTransferErrorCode.FAILED_TO_RETRIEVE_FILE_METADATA);
    }
  }

  public async transferAttachments(tk: TransferKey): Promise<void> {
    const BATCH_SIZE = 100;
    const { fileUploadService } = this.crowi;
    const Attachment = this.crowi.model('Attachment');
    const filesFromNewGrowi = await this.listFilesInStorage(tk);

    /**
     * Given these documents,
     *
     * | fileName | fileSize |
     * | -- | -- |
     * | a.png | 1024 |
     * | b.png | 2048 |
     * | c.png | 1024 |
     * | d.png | 2048 |
     *
     * this filter
     *
     * ```jsonc
     * {
     *   $and: [
     *     // a file transferred
     *     {
     *       $or: [
     *         { fileName: { $ne: "a.png" } },
     *         { fileSize: { $ne: 1024 } }
     *       ]
     *     },
     *     // a file failed to transfer
     *     {
     *       $or: [
     *         { fileName: { $ne: "b.png" } },
     *         { fileSize: { $ne: 0 } }
     *       ]
     *     }
     *   ]
     * }
     * ```
     *
     * results in
     *
     * | fileName | fileSize |
     * | -- | -- |
     * | b.png | 2048 |
     * | c.png | 1024 |
     * | d.png | 2048 |
     */
    const filter = filesFromNewGrowi.length > 0 ? {
      $and: filesFromNewGrowi.map(({ name, size }) => ({
        $or: [
          { fileName: { $ne: basename(name) } },
          { fileSize: { $ne: size } },
        ],
      })),
    } : {};
    const attachmentsCursor = await Attachment.find(filter).cursor();
    const batchStream = createBatchStream(BATCH_SIZE);

    for await (const attachmentBatch of attachmentsCursor.pipe(batchStream)) {
      for await (const attachment of attachmentBatch) {
        logger.debug(`processing attachment: ${attachment}`);
        let fileStream;
        try {
          // get read stream of each attachment
          fileStream = await fileUploadService.findDeliveryFile(attachment);
        }
        catch (err) {
          logger.warn(`Error occured when getting Attachment(ID=${attachment.id}), skipping: `, err);
          continue;
        }
        // TODO: get attachmentLists from destination GROWI to avoid transferring files that the dest GROWI has
        // TODO: refresh transfer key per 1 hour
        // post each attachment file data to receiver
        try {
          await this.doTransferAttachment(tk, attachment, fileStream);
        }
        catch (err) {
          logger.error(`Error occured when uploading attachment(ID=${attachment.id})`, err);
        }
      }
    }
  }

  // eslint-disable-next-line max-len
  public async startTransfer(tk: TransferKey, user: any, collections: string[], optionsMap: any): Promise<void> {
    const socket = this.crowi.socketIoService.getAdminSocket();

    socket.emit('admin:g2gProgress', {
      mongo: G2G_PROGRESS_STATUS.IN_PROGRESS,
      attachments: G2G_PROGRESS_STATUS.PENDING,
    });

    const targetConfigKeys = uploadConfigKeys;

    const uploadConfigs = Object.fromEntries(targetConfigKeys.map((key) => {
      return [key, this.crowi.configManager.getConfig('crowi', key)];
    }));

    let zipFileStream: ReadStream;
    try {
      const zipFileStat = await this.crowi.exportService.export(collections);
      const zipFilePath = zipFileStat.zipFilePath;

      zipFileStream = createReadStream(zipFilePath);
    }
    catch (err) {
      logger.error(err);
      socket.emit('admin:g2gProgress', {
        mongo: G2G_PROGRESS_STATUS.ERROR,
        attachments: G2G_PROGRESS_STATUS.PENDING,
      });
      socket.emit('admin:g2gError', { message: 'Failed to generate GROWI archive file', key: 'admin:g2g:error_generate_growi_archive' });
      throw err;
    }

    // Send a zip file to other growi via axios
    try {
      // Use FormData to immitate browser's form data object
      const form = new FormData();

      const appTitle = this.crowi.appService.getAppTitle();
      form.append('transferDataZipFile', zipFileStream, `${appTitle}-${Date.now}.growi.zip`);
      form.append('collections', JSON.stringify(collections));
      form.append('optionsMap', JSON.stringify(optionsMap));
      form.append('operatorUserId', user._id.toString());
      form.append('uploadConfigs', JSON.stringify(uploadConfigs));
      await rawAxios.post('/_api/v3/g2g-transfer/', form, generateAxiosRequestConfigWithTransferKey(tk, form.getHeaders()));
    }
    catch (err) {
      logger.error(err);
      socket.emit('admin:g2gProgress', {
        mongo: G2G_PROGRESS_STATUS.ERROR,
        attachments: G2G_PROGRESS_STATUS.PENDING,
      });
      socket.emit('admin:g2gError', { message: 'Failed to send GROWI archive file to new GROWI', key: 'admin:g2g:error_send_growi_archive' });
      throw err;
    }

    socket.emit('admin:g2gProgress', {
      mongo: G2G_PROGRESS_STATUS.COMPLETED,
      attachments: G2G_PROGRESS_STATUS.IN_PROGRESS,
    });

    try {
      await this.transferAttachments(tk);
    }
    catch (err) {
      logger.error(err);
      socket.emit('admin:g2gProgress', {
        mongo: G2G_PROGRESS_STATUS.COMPLETED,
        attachments: G2G_PROGRESS_STATUS.ERROR,
      });
      socket.emit('admin:g2gError', { message: 'Failed to transfer attachments', key: 'admin:g2g:error_upload_attachment' });
      throw err;
    }

    socket.emit('admin:g2gProgress', {
      mongo: G2G_PROGRESS_STATUS.COMPLETED,
      attachments: G2G_PROGRESS_STATUS.COMPLETED,
    });
  }

  /**
   * transfer attachment to destination GROWI
   * @param tk Transfer key
   * @param attachment Attachment model instance
   * @param fileStream Attachment data(loaded from storage)
   */
  private async doTransferAttachment(tk: TransferKey, attachment, fileStream: Readable) {
    // Use FormData to immitate browser's form data object
    const form = new FormData();

    form.append('content', fileStream, attachment.fileName);
    form.append('attachmentMetadata', JSON.stringify(attachment));
    await rawAxios.post('/_api/v3/g2g-transfer/attachment', form, generateAxiosRequestConfigWithTransferKey(tk, form.getHeaders()));
  }

}

export class G2GTransferReceiverService implements Receiver {

  crowi: any;

  constructor(crowi: any) {
    this.crowi = crowi;
  }

  public async validateTransferKey(key: string): Promise<void> {
    const transferKey = await (TransferKeyModel as any).findOne({ key });

    if (transferKey == null) {
      throw new Error(`Transfer key "${key}" was expired or not found`);
    }

    try {
      TransferKey.parse(transferKey.keyString);
    }
    catch (err) {
      logger.error(err);
      throw new Error(`Transfer key "${key}" is invalid`);
    }
  }

  /**
   * generate GROWIInfo
   * @returns
   */
  public async answerGROWIInfo(): Promise<IDataGROWIInfo> {
    // TODO: add attachment file limit
    const { version, configManager, fileUploadService } = this.crowi;
    const userUpperLimit = configManager.getConfig('crowi', 'security:userUpperLimit');
    const fileUploadDisabled = configManager.getConfig('crowi', 'app:fileUploadDisabled');
    const fileUploadTotalLimit = configManager.getFileUploadTotalLimit();
    const isWritable = await fileUploadService.isWritable();

    const attachmentInfo = {
      type: configManager.getConfig('crowi', 'app:fileUploadType'),
      writable: isWritable,
      bucket: undefined,
      customEndpoint: undefined, // for S3
      uploadNamespace: undefined, // for GCS
    };

    // put storage location info to check storage identification
    switch (attachmentInfo.type) {
      case 'aws':
        attachmentInfo.bucket = configManager.getConfig('crowi', 'aws:s3Bucket');
        attachmentInfo.customEndpoint = configManager.getConfig('crowi', 'aws:s3CustomEndpoint');
        break;
      case 'gcs':
        attachmentInfo.bucket = configManager.getConfig('crowi', 'gcs:bucket');
        attachmentInfo.uploadNamespace = configManager.getConfig('crowi', 'gcs:uploadNamespace');
        break;
      default:
    }

    return {
      userUpperLimit,
      fileUploadDisabled,
      fileUploadTotalLimit,
      version,
      attachmentInfo,
    };
  }

  public async createTransferKey(appSiteUrlOrigin: string): Promise<string> {
    const uuid = new MongooseTypes.ObjectId().toString();
    const transferKeyString = TransferKey.generateKeyString(uuid, appSiteUrlOrigin);

    // Save TransferKey document
    let tkd;
    try {
      tkd = await TransferKeyModel.create({ _id: uuid, keyString: transferKeyString, key: uuid });
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return tkd.keyString;
  }

  public async receive(zipfile: Readable): Promise<void> {
    // Import data
    // Call onCompleteTransfer when finished

    return;
  }

  /**
   *
   * @param content Pushed attachment data from source GROWI
   * @param attachmentMap Map-ped Attachment instance
   * @returns
   */
  public async receiveAttachment(content: Readable, attachmentMap): Promise<void> {
    // TODO: test with S3, local
    const { fileUploadService } = this.crowi;
    return fileUploadService.uploadAttachment(content, attachmentMap);
  }

  /**
   * Sync DB, etc.
   * @returns {Promise<void>}
   */
  private async onCompleteTransfer(): Promise<void> { return }

}
