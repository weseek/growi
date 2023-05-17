const GrowiArchiveImportOption = require('./growi-archive-import-option');

const DEFAULT_PROPS = {
  isOverwriteAuthorWithCurrentUser: false,
};

class ImportOptionForRevisions extends GrowiArchiveImportOption {

  constructor(mode, initProps) {
    super(mode, initProps || DEFAULT_PROPS);
  }

}

module.exports = ImportOptionForRevisions;
