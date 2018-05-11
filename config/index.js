function envShortName() {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'prod';
    default:
      return 'dev';
  }
}

module.exports = {
  env: require(`./env.${envShortName()}`),
  logger: require(`./logger/config.${envShortName()}`),
};
