module.exports = (crowi) => {
  const { appService } = crowi;

  return async(req, res, next) => {
    const isInstalled = await appService.isDBInitialized();

    if (!isInstalled) {
      return res.redirect('/installer');
    }

    return next();
  };
};
