const { createLogger } = require('universal-bunyan');

const configForDev = require('@root/config/logger/config.dev');
const configForProd = require('@root/config/logger/config.prod');

const isProduction = process.env.NODE_ENV === 'production';
const config = isProduction ? configForProd : configForDev;

const loggerFactory = function(name) {
  return createLogger({
    name,
    config,
  });
};

module.exports = loggerFactory;
