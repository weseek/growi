import {
  S3Client, HeadObjectCommand, GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import urljoin from 'url-join';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:service:fileUploaderAws');

type AwsCredential = {
  accessKeyId: string,
  secretAccessKey: string
}
type AwsConfig = {
  credentials: AwsCredential,
  region: string,
  endpoint: string,
  bucket: string,
}

module.exports = (crowi) => {
  const Uploader = require('./uploader');
  const { configManager } = crowi;
  const lib = new Uploader(crowi);

  const getAwsConfig = (): AwsConfig => {
    return {
      credentials: {
        accessKeyId: configManager.getConfig('crowi', 'aws:s3AccessKeyId'),
        secretAccessKey: configManager.getConfig('crowi', 'aws:s3SecretAccessKey'),
      },
      region: configManager.getConfig('crowi', 'aws:s3Region'),
      endpoint: configManager.getConfig('crowi', 'aws:s3CustomEndpoint') || undefined,
      bucket: configManager.getConfig('crowi', 'aws:s3Bucket'),
    };
  };

  const S3Factory = () => {
    const config = getAwsConfig();
    return new S3Client(config);
  };

  const getFilePathOnStorage = (attachment) => {
    if (attachment.filePath != null) {
      return attachment.filePath;
    }

    const dirName = (attachment.page != null)
      ? 'attachment'
      : 'user';
    const filePath = urljoin(dirName, attachment.fileName);

    return filePath;
  };

  const isFileExists = async(s3, params) => {
    try {
      await s3.send(new HeadObjectCommand(params));
    }
    catch (err) {
      if (err != null && err.code === 'NotFound') {
        return false;
      }
      throw err;
    }
    return true;
  };

  lib.isValidUploadSettings = () => {
    return configManager.getConfig('crowi', 'aws:s3AccessKeyId') != null
      && configManager.getConfig('crowi', 'aws:s3SecretAccessKey') != null
      && (
        configManager.getConfig('crowi', 'aws:s3Region') != null
          || configManager.getConfig('crowi', 'aws:s3CustomEndpoint') != null
      )
      && configManager.getConfig('crowi', 'aws:s3Bucket') != null;
  };

  lib.canRespond = () => {
    return !configManager.getConfig('crowi', 'aws:referenceFileWithRelayMode');
  };

  lib.respond = async(res, attachment) => {
    if (!lib.getIsUploadable()) {
      throw new Error('AWS is not configured.');
    }
    const temporaryUrl = attachment.getValidTemporaryUrl();
    if (temporaryUrl != null) {
      return res.redirect(temporaryUrl);
    }

    const s3 = S3Factory();
    const awsConfig = getAwsConfig();
    const filePath = getFilePathOnStorage(attachment);
    const lifetimeSecForTemporaryUrl = configManager.getConfig('crowi', 'aws:lifetimeSecForTemporaryUrl');

    // issue signed url (default: expires 120 seconds)
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property
    const params = {
      Bucket: awsConfig.bucket,
      Key: filePath,
      Expires: lifetimeSecForTemporaryUrl,
    };
    const signedUrl = await getSignedUrl(s3, new GetObjectCommand(params));


    res.redirect(signedUrl);

    try {
      return attachment.cashTemporaryUrlByProvideSec(signedUrl, lifetimeSecForTemporaryUrl);
    }
    catch (err) {
      logger.error(err);
    }

  };


  return lib;
};
