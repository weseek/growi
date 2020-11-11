const { serializeUserSecurely } = require('./user-serializer');

function depopulate(page, attributeName) {
  // revert the ObjectID
  if (page[attributeName] != null && page[attributeName]._id != null) {
    page[attributeName] = page[attributeName]._id;
  }
}

function depopulateRevisions(page) {
  depopulate(page, 'revision');
  depopulate(page, 'revisionHackmdSynced');
}

function serializeInsecureUserAttributes(page) {
  if (page.lastUpdateUser != null && page.lastUpdateUser._id != null) {
    page.lastUpdateUser = serializeUserSecurely(page.lastUpdateUser);
  }
  if (page.creator != null && page.creator._id != null) {
    page.creator = serializeUserSecurely(page.creator);
  }
  return page;
}

function serializePageSecurely(page) {
  let serialized = page;

  // invoke toObject if page is a model instance
  if (page.toObject != null) {
    serialized = page.toObject();
  }

  depopulateRevisions(serialized);
  serializeInsecureUserAttributes(serialized);

  return serialized;
}

module.exports = {
  serializePageSecurely,
};
