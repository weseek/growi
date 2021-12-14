import Logger from 'bunyan';
import { createLogger } from 'universal-bunyan';

export const loggerFactory = function(name: string): Logger {
  return createLogger({
    name,
    config: { default: 'info' },
  });
};
