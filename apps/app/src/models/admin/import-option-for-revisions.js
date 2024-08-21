const GrowiArchiveImportOption = require('./growi-archive-import-option');

const DEFAULT_PROPS = {
  isOverwriteAuthorWithCurrentUser: false,
};

export class ImportOptionForRevisions extends GrowiArchiveImportOption {

  constructor(collectionName, mode, initProps) {
    super(collectionName, mode, initProps || DEFAULT_PROPS);
  }

}
