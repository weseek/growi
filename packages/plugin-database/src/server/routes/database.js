module.exports = (crowi, app) => {
  const Page = crowi.model('Page');
  const actions = {};

  actions.getDatabase = async(req, res) => {
    const user = req.user;

    let path;
    let page;

    try {
      path = req.query.path;
    }
    catch (error) {
      return res.status(400).send(error);
    }

    try {
      page = await Page.findByPathAndViewer(path, user, null, true);
    }
    catch (err) {
      return res.status(500).send(err);
    }

    if (page == null) {
      return res.status(500).send(new Error('Page is not found'));
    }

    if (page != null) {
      try {
        page.initLatestRevisionField();

        // populate
        page = await page.populateDataToShowRevision();
      }
      catch (err) {
        return res.status(500).send(err);
      }
    }

    const body = page.revision.body;

    res.status(200).send(body);
  };

  return actions;
};
