import { isValidObjectId } from 'mongoose';

class RevisionService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  async isSpecifiedRevisionExist(revisionId: string): Promise<boolean> {
    const Revision = this.crowi.model('Revision');
    return isValidObjectId(revisionId) ? Revision.exists({ _id: revisionId }) : false;
  }

}

export default RevisionService;
