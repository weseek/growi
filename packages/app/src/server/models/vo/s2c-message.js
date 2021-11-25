const { serializePageSecurely } = require('../serializers/page-serializer');

/**
 * Server-to-client message VO
 */
class S2cMessagePageUpdated {


  constructor(page, user) {
    const serializedPage = serializePageSecurely(page);

    const {
      _id, revision, updatedAt, revisionHackmdSynced, hasDraftOnHackmd,
    } = serializedPage;

    this.pageId = _id;
    this.revisionId = revision;
    this.revisionBody = page.revision.body;
    this.revisionUpdateAt = updatedAt;
    this.revisionIdHackmdSynced = revisionHackmdSynced;
    this.hasDraftOnHackmd = hasDraftOnHackmd;

    if (user != null) {
      this.lastUpdateUsername = user.name;
      this.lastUpdateUserImagePath = user.imageUrlCached;
    }
  }

}

module.exports = {
  S2cMessagePageUpdated,
};
