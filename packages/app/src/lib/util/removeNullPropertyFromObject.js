// remove property if value is null

const removeNullPropertyFromObject = (object) => {

  for (const [key, value] of Object.entries(object)) {
    if (value == null) { delete object[key] }
  }

  return object;
};

module.exports = removeNullPropertyFromObject;
