import Logger from 'bunyan';
import { createLogger } from 'universal-bunyan';

const loggerFactory = function(name: string): Logger {
  return createLogger({
    name,
    config: { default: 'info' },
  });
};

export default loggerFactory;
