import type GrowiArchiveImportOption from '~/models/admin/growi-archive-import-option';
import { isImportOptionForPages } from '~/models/admin/import-option-for-pages';

import type { OverwriteParams } from '../import-settings';

import { overwriteParams as overwriteParamsForAttachmentFilesChunks } from './attachmentFiles.chunks';
import { generateOverwriteParams as generateForPages } from './pages';
import { generateOverwriteParams as generateForRevisions } from './revisions';

/**
 * generate overwrite params with overwrite-params/* modules
 */
export const generateOverwriteParams = <OPT extends GrowiArchiveImportOption>(
  collectionName: string, operatorUserId: string, options: OPT,
): OverwriteParams => {

  switch (collectionName) {
    case 'pages':
      if (!isImportOptionForPages(options)) {
        throw new Error('Invalid option for pages');
      }
      return generateForPages(operatorUserId, options);
    case 'revisions':
      if (!isImportOptionForPages(options)) {
        throw new Error('Invalid option for revisions');
      }
      return generateForRevisions(operatorUserId, options);
    case 'attachmentFiles.chunks':
      return overwriteParamsForAttachmentFilesChunks;
    default:
      return {};
  }
};
