import loggerFactory from '~/utils/logger';

import { convertRevisionPageIdToString } from './convert-revision-page-id-to-string';
import { renameDuplicateRootPages } from './rename-duplicate-root-pages';

const logger = loggerFactory('growi:service:NormalizeData');

export const normalizeData = async(): Promise<void> => {
  await renameDuplicateRootPages();
  await convertRevisionPageIdToString();

  logger.info('normalizeData has been executed');
  return;
};
