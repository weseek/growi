import bunyanFormat from 'bunyan-format';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';

const isBrowser: boolean = typeof window !== 'undefined';

let stream;

// browser settings
if (isBrowser) {
  stream = new ConsoleFormattedStream();
}
// node settings
else {
  stream = bunyanFormat({ outputMode: 'short' });
}

module.exports = stream;
