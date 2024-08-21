import type GrowiArchiveImportOption from '~/models/admin/growi-archive-import-option';

import type { OverwriteParams } from '../import-settings';

import overwriteParamsAttachmentFilesChunks from './attachmentFiles.chunks';
import overwriteParamsPages from './pages';
import overwriteParamsRevisions from './revisions';

/**
 * generate overwrite params with overwrite-params/* modules
 */
export const generateOverwriteParams = (collectionName: string, operatorUserId: string, options: GrowiArchiveImportOption): OverwriteParams => {
  switch (collectionName) {
    case 'pages':
      return overwriteParamsPages(operatorUserId, options);
    case 'revisions':
      return overwriteParamsRevisions(operatorUserId, options);
    case 'attachmentFiles.chunks':
      return overwriteParamsAttachmentFilesChunks(operatorUserId, options);
    default:
      return {};
  }
};
