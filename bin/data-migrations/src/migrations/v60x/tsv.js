module.exports = [
  (body) => {
    const oldTsvTableRegExp = /::: tsv(-h)?\n([\s\S]*?)\n:::/g; // TSV old format
    return body.replace(oldTsvTableRegExp, '``` tsv$1\n$2\n```');
  },
];
