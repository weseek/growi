function injectApiv3ErrMock(app) {
  app.response.apiv3Err = jest.fn(
    function(errors, status = 400, info) { // not arrow function
      this.status(status).json({ errors, info });
    },
  );
  return app.response.apiv3Err;
}
module.exports = {
  mockingApiv3Err,
};
