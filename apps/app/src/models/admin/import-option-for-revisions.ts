import { ImportMode } from '~/server/service/import';

import { GrowiArchiveImportOption } from './growi-archive-import-option';

const DEFAULT_PROPS = {
  isOverwriteAuthorWithCurrentUser: false,
};

export class ImportOptionForRevisions extends GrowiArchiveImportOption {

  constructor(collectionName: string, mode: ImportMode = ImportMode.insert, initProps = DEFAULT_PROPS) {
    super(collectionName, mode, initProps);
  }

}
