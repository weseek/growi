const { serializePageSecurely } = require('../serializers/page-serializer');

/**
 * Server-to-client message VO
 */
class S2cMessagePageUpdated {

  constructor(page, user) {
    const serializedPage = serializePageSecurely(page);

    this.pageId = serializedPage._id;
    this.revisionId = serializedPage.revision;
    this.revisionIdHackmdSynced = serializedPage.revisionHackmdSynced;
    this.hasDraftOnHackmd = serializedPage.hasDraftOnHackmd;

    if (user != null) {
      this.lastUpdateUsername = user.name;
    }
  }

}

module.exports = {
  S2cMessagePageUpdated,
};
