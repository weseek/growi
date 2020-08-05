class PageService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  serializeToObj(page) {
    const { User } = this.crowi.models;

    const returnObj = page.toObject();

    // set the ObjectID to revisionHackmdSynced
    if (page.revisionHackmdSynced != null && page.revisionHackmdSynced._id != null) {
      returnObj.revisionHackmdSynced = page.revisionHackmdSynced._id;
    }

    if (page.lastUpdateUser != null && page.lastUpdateUser instanceof User) {
      returnObj.lastUpdateUser = page.lastUpdateUser.toObject();
    }
    if (page.creator != null && page.creator instanceof User) {
      returnObj.creator = page.creator.toObject();
    }

    return returnObj;
  }

}

module.exports = PageService;
