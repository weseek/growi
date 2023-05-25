module.exports = [
  (body) => {
    // https://regex101.com/r/btZ4hc/1
    // eslint-disable-next-line regex/invalid
    const oldBracketLinkRegExp = /(?<!\[)\[{1}(\/.*?)\]{1}(?!\])/g; // Page Link old format
    return body.replace(oldBracketLinkRegExp, '[[$1]]');
  },
];
