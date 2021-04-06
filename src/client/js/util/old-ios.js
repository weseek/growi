const userAgent = window.navigator.userAgent.toLowerCase();
// https://youtrack.weseek.co.jp/issue/GW-4826
const isOldIos = /(iphone|ipad|ipod) os (9|10|11|12)/.test(userAgent);

/**
 * Apply 'oldIos' attribute to <html></html>
 */
function applyOldIos() {
  if (isOldIos) {
    document.documentElement.setAttribute('old-ios', 'true');
  }
}

export {
  // eslint-disable-next-line import/prefer-default-export
  applyOldIos,
};
