import type Logger from 'bunyan';
import { createLogger } from 'universal-bunyan';

const loggerFactory = function(name: string): Logger {
  return createLogger({ name });
};

export default loggerFactory;
