
/* eslint-disable no-undef, no-var, vars-on-top, no-restricted-globals, regex/invalid */
// ignore lint error because this file is js as mongoshell

// ===========================================
// processors for old format
// ===========================================

// processor for MIGRATION_FILE_NAME=custom, MIGRATION_TYPE=custom
function customProcessor(body) {
  // ADD YOUR PROCESS HERE!
  // https://github.com/weseek/growi/discussions/7180
  return body;
}

function getProcessorArray(migrationType) {
  var oldFormatProcessors;
  switch (migrationType) {
    case 'custom':
      oldFormatProcessors = [customProcessor];
      break;
    default:
      oldFormatProcessors = [];
  }
  return oldFormatProcessors;
}

module.exports = getProcessorArray;
