import bunyanFormat from 'bunyan-format';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { Writable } from 'stream';

const isBrowser: boolean = typeof window !== 'undefined';

function determineStream(): Writable {
  // browser settings
  if (isBrowser) {
    return new ConsoleFormattedStream();
  }

  // node settings
  return bunyanFormat({ outputMode: 'short' });
}

export default determineStream();
