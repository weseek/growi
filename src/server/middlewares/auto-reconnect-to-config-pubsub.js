module.exports = (crowi) => {
  const { configPubsub } = crowi;

  return async(req, res, next) => {
    if (configPubsub != null) {
      configPubsub.subscribe();
    }

    return next();
  };
};
