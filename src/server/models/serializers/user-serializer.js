function omitInsecureAttributes(user) {
  // omit password
  delete user.password;
  // omit email
  if (!user.isEmailPublished) {
    delete user.email;
  }
  return user;
}

function serializeUserSecurely(user) {
  let serialized = user;

  // invoke toObject if page is a model instance
  if (user.toObject != null) {
    serialized = user.toObject();
  }

  omitInsecureAttributes(serialized);

  return serialized;
}

module.exports = {
  omitInsecureAttributes,
  serializeUserSecurely,
};
