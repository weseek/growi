import bunyanFormat from 'bunyan-format';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { envUtils } from 'growi-commons';

const isBrowser: boolean = typeof window !== 'undefined';

let stream;

// browser settings
if (isBrowser) {
  stream = new ConsoleFormattedStream();
}
// node settings
else {
  const isFormat = (process.env.FORMAT_NODE_LOG == null) || envUtils.toBoolean(process.env.FORMAT_NODE_LOG);

  if (isFormat) {
    stream = bunyanFormat({ outputMode: 'long' });
  }
  else {
    stream = process.stdout;
  }
}

module.exports = stream;
