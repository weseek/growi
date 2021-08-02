// remove property if value is null

export const removeNullPropertyFromObject = <T>(object: T): T => {

  for (const [key, value] of Object.entries(object)) {
    if (value == null) { delete object[key] }
  }

  return object;
};
