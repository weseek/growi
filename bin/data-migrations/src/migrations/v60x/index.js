const bracketlink = require('./bracketlink');
const csv = require('./csv');
const plantUML = require('./plantuml');
const tsv = require('./tsv');

module.exports = [...bracketlink, ...csv, ...plantUML, ...tsv];
