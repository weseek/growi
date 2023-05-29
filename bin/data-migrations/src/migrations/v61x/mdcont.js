module.exports = [
  (body) => {
    const oldMdcontPrefixRegExp = /#mdcont-/g;
    return body.replace(oldMdcontPrefixRegExp, '#');
  },
];
