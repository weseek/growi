/**
 * convert to boolean
 *
 * @param {string} value
 * @returns {boolean}
 * @memberof envUtils
 */
export function toBoolean(value) {
  return /^(true|1)$/i.test(value);
}
