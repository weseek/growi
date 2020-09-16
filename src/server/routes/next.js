module.exports = function(crowi, app) {

  const { nextApp } = crowi;
  const handle = nextApp.getRequestHandler();

  const delegateToNext = (req, res) => {
    req.crowi = crowi;
    return handle(req, res);
  };

  return {
    delegateToNext,
  };

};
