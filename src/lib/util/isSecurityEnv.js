/**
 * return whether env belongs to Security settings
 * @param {string} key ex. 'security:passport-saml:isEnabled' is true
 * @returns {boolean}
 * @memberof envUtils
 */
const isSecurityEnv = (key) => {
  const array = key.split(':');
  return (array[0] === 'security');
};

module.exports = isSecurityEnv;
