const bracketlink = require('./bracketlink');
const csv = require('./csv');
const drawio = require('./drawio');
const plantUML = require('./plantuml');
const tsv = require('./tsv');

module.exports = [...bracketlink, ...csv, ...drawio, ...plantUML, ...tsv];
