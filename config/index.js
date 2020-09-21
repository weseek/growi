function envShortName() {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'prod';
    default:
      return 'dev';
  }
}

module.exports = {
  logger: require(`./logger/config.${envShortName()}`),
};
