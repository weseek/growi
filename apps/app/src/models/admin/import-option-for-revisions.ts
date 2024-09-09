import { GrowiArchiveImportOption } from './growi-archive-import-option';

const DEFAULT_PROPS = {
  isOverwriteAuthorWithCurrentUser: false,
};

export class ImportOptionForRevisions extends GrowiArchiveImportOption {

  constructor(collectionName: string, mode: string, initProps = DEFAULT_PROPS) {
    super(collectionName, mode, initProps);
  }

}
