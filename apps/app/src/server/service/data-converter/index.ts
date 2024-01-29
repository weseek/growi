import loggerFactory from '~/utils/logger';

import { renameDuplicateRootPages } from './rename-duplicate-root-pages';

const logger = loggerFactory('growi:service:DataConverter');

export const runDataConversion = async(): Promise<void> => {
  await renameDuplicateRootPages();

  logger.info('DataConverter has been executed');
  return;
};
