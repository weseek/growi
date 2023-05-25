module.exports = [
  (body) => {
    const oldDrawioRegExp = /:::\s?drawio\n(.+?)\n:::/g; // drawio old format
    return body.replace(oldDrawioRegExp, '``` drawio\n$1\n```');
  },
];
