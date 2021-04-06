module.exports = (crowi) => {
  const { appService } = crowi;

  return async(req, res, next) => {
    const isDBInitialized = await appService.isDBInitialized(true);

    if (isDBInitialized) {
      req.flash('errorMessage', req.t('message.application_already_installed'));
      return res.redirect('admin');
    }

    return next();
  };
};
