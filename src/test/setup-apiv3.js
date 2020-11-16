function mockingApiv3Err(app) {
  app.response.apiv3Err = jest.fn(
    function(errors, status = 400, info) { // not arrow function
      this.status(status).json({ errors, info });
    },
  );
}
module.exports = {
  mockingApiv3Err,
};
