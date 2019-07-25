const { envUtils } = require('growi-commons');

const isBrowser = typeof window !== 'undefined';

let stream;

// browser settings
if (isBrowser) {
  const ConsoleFormattedStream = require('@browser-bunyan/console-formatted-stream').ConsoleFormattedStream;
  stream = new ConsoleFormattedStream();
}
// node settings
else {
  const isFormat = (process.env.FORMAT_NODE_LOG == null) || envUtils.toBoolean(process.env.FORMAT_NODE_LOG);

  if (isFormat) {
    const bunyanFormat = require('bunyan-format');
    stream = bunyanFormat({ outputMode: 'long' });
  }
}

module.exports = stream;
