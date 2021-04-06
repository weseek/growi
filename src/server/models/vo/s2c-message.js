const { serializePageSecurely } = require('../serializers/page-serializer');

/**
 * Server-to-client message VO
 */
class S2cMessagePageUpdated {


  constructor(page, user) {
    const serializedPage = serializePageSecurely(page);

    const {
      _id, revision, revisionHackmdSynced, hasDraftOnHackmd,
    } = serializedPage;

    this.pageId = _id;
    this.revisionId = revision;
    this.revisionIdHackmdSynced = revisionHackmdSynced;
    this.hasDraftOnHackmd = hasDraftOnHackmd;

    if (user != null) {
      this.lastUpdateUsername = user.name;
    }
  }

}

module.exports = {
  S2cMessagePageUpdated,
};
