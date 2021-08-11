/**
 * convert to boolean
 *
 * @param {string} value
 * @returns {boolean}
 * @memberof envUtils
 */
function toBoolean(value) {
  return /^(true|1)$/i.test(value);
}

/**
 * @namespace envUtils
 */
module.exports = {
  toBoolean,
};
