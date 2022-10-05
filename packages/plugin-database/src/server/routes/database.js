module.exports = (crowi, app) => {
  const actions = {};

  actions.getDatabase = async(req, res) => {
    try {
      res.status(200).send('hoge');
    }
    catch (error) {
      return res.status(500).send(error);
    }
  };

  return actions;
};
