module.exports = (crowi) => {
  const { configPubsub } = crowi;

  return (req, res, next) => {
    if (configPubsub != null && configPubsub.shouldResubscribe()) {
      configPubsub.subscribe();
    }

    return next();
  };
};
