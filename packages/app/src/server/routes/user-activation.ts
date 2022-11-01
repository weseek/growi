export const form = (req, res): void => {
  const { userRegistrationOrder } = req;
  return res.render('user-activation', { userRegistrationOrder });
};

// middleware to handle error
export const tokenErrorHandlerMiddeware = (err, req, res, next) => {
  if (err != null) {
    req.flash('errorMessage', req.t('message.incorrect_token_or_expired_url'));
    return res.redirect('/login#register');
  }
  next();
};
