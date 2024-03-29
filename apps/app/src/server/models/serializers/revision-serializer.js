const { serializeUserSecurely } = require('./user-serializer');

function serializeInsecureUserAttributes(revision) {
  if (revision.author != null && revision.author._id != null) {
    revision.author = serializeUserSecurely(revision.author);
  }
  return revision;
}

export function serializeRevisionSecurely(revision) {
  const serialized = revision;

  serializeInsecureUserAttributes(serialized);

  return serialized;
}
