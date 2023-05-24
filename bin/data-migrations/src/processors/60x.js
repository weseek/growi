
/* eslint-disable no-undef, no-var, vars-on-top, no-restricted-globals, regex/invalid */
// ignore lint error because this file is js as mongoshell

// ===========================================
// processors for old format
// ===========================================

function drawioProcessor(body) {
  var oldDrawioRegExp = /:::\s?drawio\n(.+?)\n:::/g; // drawio old format
  return body.replace(oldDrawioRegExp, '``` drawio\n$1\n```');
}

function plantumlProcessor(body) {
  var oldPlantUmlRegExp = /@startuml\n([\s\S]*?)\n@enduml/g; // plantUML old format
  return body.replace(oldPlantUmlRegExp, '``` plantuml\n$1\n```');
}

function tsvProcessor(body) {
  var oldTsvTableRegExp = /::: tsv(-h)?\n([\s\S]*?)\n:::/g; // TSV old format
  return body.replace(oldTsvTableRegExp, '``` tsv$1\n$2\n```');
}

function csvProcessor(body) {
  var oldCsvTableRegExp = /::: csv(-h)?\n([\s\S]*?)\n:::/g; // CSV old format
  return body.replace(oldCsvTableRegExp, '``` csv$1\n$2\n```');
}

function bracketlinkProcessor(body) {
  // https://regex101.com/r/btZ4hc/1
  var oldBracketLinkRegExp = /(?<!\[)\[{1}(\/.*?)\]{1}(?!\])/g; // Page Link old format
  return body.replace(oldBracketLinkRegExp, '[[$1]]');
}

// ===========================================
// define processors
// ===========================================

function getProcessorArray(migrationType) {
  var oldFormatProcessors;
  switch (migrationType) {
    case 'drawio':
      oldFormatProcessors = [drawioProcessor];
      break;
    case 'plantuml':
      oldFormatProcessors = [plantumlProcessor];
      break;
    case 'tsv':
      oldFormatProcessors = [tsvProcessor];
      break;
    case 'csv':
      oldFormatProcessors = [csvProcessor];
      break;
    case 'bracketlink':
      oldFormatProcessors = [bracketlinkProcessor];
      break;
    case 'all':
      oldFormatProcessors = [drawioProcessor, plantumlProcessor, tsvProcessor, csvProcessor, bracketlinkProcessor];
      break;
    default:
      oldFormatProcessors = [];
  }
  return oldFormatProcessors;
}

module.exports = getProcessorArray;
