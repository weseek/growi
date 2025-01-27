/** @param {import('~/server/crowi').default} crowi Crowi instance */
module.exports = (crowi) => {
  const { appService } = crowi;

  return async(req, res, next) => {
    const isDBInitialized = await appService.isDBInitialized(true);

    if (isDBInitialized) {
      return res.redirect('/');
    }

    return next();
  };
};
