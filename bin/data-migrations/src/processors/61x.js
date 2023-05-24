
/* eslint-disable no-undef, no-var, vars-on-top, no-restricted-globals, regex/invalid */
// ignore lint error because this file is js as mongoshell

// ===========================================
// processors for old format
// ===========================================

function mdcontPrefixProcessor(body) {
  var oldMdcontPrefixRegExp = /#mdcont-/g;
  return body.replace(oldMdcontPrefixRegExp, '#');
}

// ===========================================
// define processors
// ===========================================

function getProcessorArray(migrationType) {
  var oldFormatProcessors;
  switch (migrationType) {
    case 'mdcont':
      oldFormatProcessors = [mdcontPrefixProcessor];
      break;
    case 'all':
      oldFormatProcessors = [mdcontPrefixProcessor];
      break;
    default:
      oldFormatProcessors = [];
  }
  return oldFormatProcessors;
}

module.exports = getProcessorArray;
