import loggerFactory from '~/utils/logger';

import { configManager } from '../config-manager';

export type { FileUploader } from './file-uploader';

const logger = loggerFactory('growi:service:FileUploaderServise');

const envToModuleMappings = {
  aws:     'aws',
  local:   'local',
  mongo:   'gridfs',
  mongodb: 'gridfs',
  gridfs:  'gridfs',
  gcp:     'gcs',
  gcs:     'gcs',
  azure:   'azure',
};

export const getUploader = (): any => {
  const method = envToModuleMappings[configManager.getConfig('crowi', 'app:fileUploadType')];
  const modulePath = `./${method}`;
  const uploader = require(modulePath)();

  if (uploader == null) {
    logger.warn('Failed to initialize uploader.');
  }

  return uploader;
};

export * from './utils';
