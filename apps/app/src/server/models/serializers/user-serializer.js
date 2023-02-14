const mongoose = require('mongoose');


function omitInsecureAttributes(user) {
  // omit password
  delete user.password;
  // omit apiToken
  delete user.apiToken;

  // omit email
  if (!user.isEmailPublished) {
    delete user.email;
  }
  return user;
}

function serializeUserSecurely(user) {
  const User = mongoose.model('User');

  // return when it is not a user object
  if (user == null || !(user instanceof User)) {
    return user;
  }

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
