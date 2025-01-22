import { normalizeExpiredAtForThreadRelations } from '~/features/openai/server/services/normalize-data';
import loggerFactory from '~/utils/logger';

import { convertRevisionPageIdToObjectId } from './convert-revision-page-id-to-objectid';
import { renameDuplicateRootPages } from './rename-duplicate-root-pages';

const logger = loggerFactory('growi:service:NormalizeData');

export const normalizeData = async(): Promise<void> => {
  await renameDuplicateRootPages();
  await convertRevisionPageIdToObjectId();
  await normalizeExpiredAtForThreadRelations();

  logger.info('normalizeData has been executed');
  return;
};
