import type { ReadStream } from 'fs';

import type { TokenCredential } from '@azure/identity';
import { ClientSecretCredential } from '@azure/identity';
import type {
  BlobClient,
  BlockBlobClient,
  BlobDeleteOptions,
  ContainerClient,
} from '@azure/storage-blob';
import {
  generateBlobSASQueryParameters,
  BlobServiceClient,
  ContainerSASPermissions,
  SASProtocol,
  type BlobDeleteIfExistsResponse,
  type BlockBlobUploadResponse,
  type BlockBlobParallelUploadOptions,
} from '@azure/storage-blob';

import { ResponseMode, type RespondOptions } from '~/server/interfaces/attachment';
import type { IAttachmentDocument } from '~/server/models';
import loggerFactory from '~/utils/logger';

import { configManager } from '../config-manager';

import {
  AbstractFileUploader, type TemporaryUrl, type SaveFileParam,
} from './file-uploader';
import { ContentHeaders } from './utils';

const urljoin = require('url-join');

const logger = loggerFactory('growi:service:fileUploaderAzure');

interface FileMeta {
  name: string;
  size: number;
}

type AzureConfig = {
  accountName: string,
  containerName: string,
}


function getAzureConfig(): AzureConfig {
  return {
    accountName: configManager.getConfig('crowi', 'azure:storageAccountName'),
    containerName: configManager.getConfig('crowi', 'azure:storageContainerName'),
  };
}

function getCredential(): TokenCredential {
  const tenantId = configManager.getConfig('crowi', 'azure:tenantId');
  const clientId = configManager.getConfig('crowi', 'azure:clientId');
  const clientSecret = configManager.getConfig('crowi', 'azure:clientSecret');
  return new ClientSecretCredential(tenantId, clientId, clientSecret);
}

async function getContainerClient(): Promise<ContainerClient> {
  const { accountName, containerName } = getAzureConfig();
  const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, getCredential());
  return blobServiceClient.getContainerClient(containerName);
}

function getFilePathOnStorage(attachment) {
  const dirName = (attachment.page != null) ? 'attachment' : 'user';
  return urljoin(dirName, attachment.fileName);
}

class AzureFileUploader extends AbstractFileUploader {

  /**
   * @inheritdoc
   */
  override isValidUploadSettings(): boolean {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  override listFiles() {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  override saveFile(param: SaveFileParam) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  override deleteFiles() {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  override async uploadAttachment(readStream: ReadStream, attachment: IAttachmentDocument): Promise<void> {
    if (!this.getIsUploadable()) {
      throw new Error('Azure is not configured.');
    }

    logger.debug(`File uploading: fileName=${attachment.fileName}`);
    const filePath = getFilePathOnStorage(attachment);
    const containerClient = await getContainerClient();
    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(filePath);
    const contentHeaders = new ContentHeaders(attachment);

    await blockBlobClient.uploadStream(readStream, undefined, undefined, {
      blobHTTPHeaders: {
        // put type and the file name for reference information when uploading
        blobContentType: contentHeaders.contentType?.value.toString(),
        blobContentDisposition: contentHeaders.contentDisposition?.value.toString(),
      },
    });
  }

  /**
   * @inheritdoc
   */
  override determineResponseMode() {
    return configManager.getConfig('crowi', 'azure:referenceFileWithRelayMode')
      ? ResponseMode.RELAY
      : ResponseMode.REDIRECT;
  }

  /**
   * @inheritdoc
   */
  override respond(): void {
    throw new Error('AzureFileUploader does not support ResponseMode.DELEGATE.');
  }

  /**
   * @inheritdoc
   */
  override async findDeliveryFile(attachment: IAttachmentDocument): Promise<NodeJS.ReadableStream> {
    if (!this.getIsReadable()) {
      throw new Error('Azure is not configured.');
    }

    const filePath = getFilePathOnStorage(attachment);
    const containerClient = await getContainerClient();
    const blobClient: BlobClient = containerClient.getBlobClient(filePath);
    const downloadResponse = await blobClient.download();
    if (downloadResponse.errorCode) {
      logger.error(downloadResponse.errorCode);
      throw new Error(downloadResponse.errorCode);
    }
    if (!downloadResponse?.readableStreamBody) {
      throw new Error(`Coudn't get file from Azure for the Attachment (${filePath})`);
    }

    return downloadResponse.readableStreamBody;
  }

  /**
   * @inheritDoc
   * @see https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-create-user-delegation-sas-javascript
   */
  override async generateTemporaryUrl(attachment: IAttachmentDocument, opts?: RespondOptions): Promise<TemporaryUrl> {
    if (!this.getIsUploadable()) {
      throw new Error('Azure Blob is not configured.');
    }

    const lifetimeSecForTemporaryUrl = configManager.getConfig('crowi', 'azure:lifetimeSecForTemporaryUrl');

    const url = await (async() => {
      const containerClient = await getContainerClient();
      const filePath = getFilePathOnStorage(attachment);
      const blockBlobClient = await containerClient.getBlockBlobClient(filePath);
      return blockBlobClient.url;
    })();

    const sasToken = await (async() => {
      const { accountName, containerName } = getAzureConfig();
      const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, getCredential());

      const now = Date.now();
      const startsOn = new Date(now - 30 * 1000);
      const expiresOn = new Date(now + lifetimeSecForTemporaryUrl * 1000);
      const userDelegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);

      const isDownload = opts?.download ?? false;
      const contentHeaders = new ContentHeaders(attachment, { inline: !isDownload });

      // https://github.com/Azure/azure-sdk-for-js/blob/d4d55f73/sdk/storage/storage-blob/src/ContainerSASPermissions.ts#L24
      // r:read, a:add, c:create, w:write, d:delete, l:list
      const containerPermissionsForAnonymousUser = 'rl';
      const sasOptions = {
        containerName,
        permissions: ContainerSASPermissions.parse(containerPermissionsForAnonymousUser),
        protocol: SASProtocol.HttpsAndHttp,
        startsOn,
        expiresOn,
        contentType: contentHeaders.contentType?.value.toString(),
        contentDisposition: contentHeaders.contentDisposition?.value.toString(),
      };

      return generateBlobSASQueryParameters(sasOptions, userDelegationKey, accountName).toString();
    })();

    const signedUrl = `${url}?${sasToken}`;

    return {
      url: signedUrl,
      lifetimeSec: lifetimeSecForTemporaryUrl,
    };

  }

}

module.exports = (crowi) => {
  const lib = new AzureFileUploader(crowi);

  lib.isValidUploadSettings = function() {
    return configManager.getConfig('crowi', 'azure:storageAccountName') != null
      && configManager.getConfig('crowi', 'azure:storageContainerName') != null;
  };

  (lib as any).deleteFile = async function(attachment) {
    const filePath = getFilePathOnStorage(attachment);
    const containerClient = await getContainerClient();
    const blockBlobClient = await containerClient.getBlockBlobClient(filePath);
    const options: BlobDeleteOptions = { deleteSnapshots: 'include' };
    const blobDeleteIfExistsResponse: BlobDeleteIfExistsResponse = await blockBlobClient.deleteIfExists(options);
    if (!blobDeleteIfExistsResponse.errorCode) {
      logger.info(`deleted blob ${filePath}`);
    }
  };

  (lib as any).deleteFiles = async function(attachments) {
    if (!lib.getIsUploadable()) {
      throw new Error('Azure is not configured.');
    }
    for await (const attachment of attachments) {
      (lib as any).deleteFile(attachment);
    }
  };

  lib.saveFile = async function({ filePath, contentType, data }) {
    const containerClient = await getContainerClient();
    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(filePath);
    const options: BlockBlobParallelUploadOptions = {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    };
    const blockBlobUploadResponse: BlockBlobUploadResponse = await blockBlobClient.upload(data, data.length, options);
    if (blockBlobUploadResponse.errorCode) { throw new Error(blockBlobUploadResponse.errorCode) }
    return;
  };

  (lib as any).checkLimit = async function(uploadFileSize) {
    const maxFileSize = configManager.getConfig('crowi', 'app:maxFileSize');
    const gcsTotalLimit = configManager.getConfig('crowi', 'app:fileUploadTotalLimit');
    return lib.doCheckLimit(uploadFileSize, maxFileSize, gcsTotalLimit);
  };

  (lib as any).listFiles = async function() {
    if (!lib.getIsReadable()) {
      throw new Error('Azure is not configured.');
    }

    const files: FileMeta[] = [];
    const containerClient = await getContainerClient();

    for await (const blob of containerClient.listBlobsFlat({
      includeMetadata: false,
      includeSnapshots: false,
      includeTags: false,
      includeVersions: false,
      prefix: '',
    })) {
      files.push(
        { name: blob.name, size: blob.properties.contentLength || 0 },
      );
    }

    return files;
  };

  return lib;
};
