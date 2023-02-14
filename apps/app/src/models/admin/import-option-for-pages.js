const GrowiArchiveImportOption = require('./growi-archive-import-option');

const DEFAULT_PROPS = {
  isOverwriteAuthorWithCurrentUser: false,
  makePublicForGrant2: false,
  makePublicForGrant4: false,
  makePublicForGrant5: false,
  initPageMetadatas: false,
  initHackmdDatas: false,
};

class ImportOptionForPages extends GrowiArchiveImportOption {

  constructor(mode, initProps) {
    super(mode, initProps || DEFAULT_PROPS);
  }

}

module.exports = ImportOptionForPages;
