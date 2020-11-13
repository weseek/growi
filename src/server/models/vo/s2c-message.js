const { serializePageSecurely } = require('../serializers/page-serializer');

/**
 * Server-to-client message VO
 */
class S2cMessagePageUpdated {

  constructor(page, user) {
    const serializedPage = serializePageSecurely(page, true);

    const {
      _id, revision, revisionHackmdSynced, hasDraftOnHackmd,
    } = serializedPage;

    if (_id != null) {
      this.pageId = _id;
    }
    if (revision != null) {
      this.revisionId = revision;
    }
    if (revisionHackmdSynced != null) {
      this.revisionIdHackmdSynced = revisionHackmdSynced;
    }
    if (hasDraftOnHackmd != null) {
      this.hasDraftOnHackmd = hasDraftOnHackmd;
    }
    if (user != null) {
      this.lastUpdateUsername = user.name;
    }
  }

}

module.exports = {
  S2cMessagePageUpdated,
};
