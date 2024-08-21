import GrowiArchiveImportOption from './growi-archive-import-option';

const DEFAULT_PROPS = {
  isOverwriteAuthorWithCurrentUser: false,
  makePublicForGrant2: false,
  makePublicForGrant4: false,
  makePublicForGrant5: false,
  initPageMetadatas: false,
};

export class ImportOptionForPages extends GrowiArchiveImportOption {

  isOverwriteAuthorWithCurrentUser;

  makePublicForGrant2;

  makePublicForGrant4;

  makePublicForGrant5;

  initPageMetadatas;

  constructor(mode, initProps) {
    super(mode, initProps || DEFAULT_PROPS);
  }

}

export const isImportOptionForPages = (opt: GrowiArchiveImportOption): opt is ImportOptionForPages => {
  return 'isOverwriteAuthorWithCurrentUser' in opt;
};
