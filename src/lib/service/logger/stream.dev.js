const isBrowser = typeof window !== 'undefined';

let stream = undefined;

// browser settings
if (isBrowser) {
  const ConsoleFormattedStream = require('@browser-bunyan/console-formatted-stream').ConsoleFormattedStream;
  stream = new ConsoleFormattedStream();
}
// node settings
else {
  const bunyanFormat = require('bunyan-format');
  stream = bunyanFormat({ outputMode: 'short' });
}

module.exports = stream;
