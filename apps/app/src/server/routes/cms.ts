import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:cms:pages');

module.exports = function(crowi) {
  const Page = crowi.model('Page');

  const actions: any = {};
  const api: any = {};

  actions.api = api;

  /**
   * @api {get} /pages.get get pages
   * @apiName get
   * @apiGroup Page
   *
   * @apiParam {String} id
   */
  api.get = async function(req, res) {
    const pageId = req.params.pageId;

    let page;

    try {
      page = await Page.findByIdAndViewer(pageId);
    }
    catch (err) {
      logger.error('get-page-failed', err);
      return res.apiv3Err(err, 500);
    }

    if (page == null) {
      return res.apiv3Err('Page is not found', 404);
    }

    if (page != null) {
      try {
        page.initLatestRevisionField(undefined);

        // populate
        page = await page.populateDataToShowRevision();
      }
      catch (err) {
        logger.error('populate-page-failed', err);
        return res.apiv3Err(err, 500);
      }
    }

    return res.apiv3({ page });
  };

  return actions;
};
