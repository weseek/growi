module.exports = (crowi) => {
  const { appService } = crowi;

  return async(req, res, next) => {
    const isInstalled = await appService.isDBInitialized();

    if (isInstalled) {
      req.flash('errorMessage', req.t('message.application_already_installed'));
      return res.redirect('admin');
    }

    return next();
  };
};
