module.exports = [
  (body) => {
    const oldCsvTableRegExp = /::: csv(-h)?\n([\s\S]*?)\n:::/g; // CSV old format
    return body.replace(oldCsvTableRegExp, '``` csv$1\n$2\n```');
  },
];
