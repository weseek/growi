import loggerFactory from '~/utils/logger';

import { renameDuplicateRootPages } from './rename-duplicate-root-pages';

const logger = loggerFactory('growi:service:NormalizeData');

export const normalizeData = async(): Promise<void> => {
  await renameDuplicateRootPages();

  logger.info('normalizeData has been executed');
  return;
};
