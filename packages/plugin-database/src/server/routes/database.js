import loggerFactory from '../../utils/logger';
import { extract, ExtractOptionError } from '../services/mutators/extract';

const logger = loggerFactory('growi-plugin:attachment-refs:routes:refs');

module.exports = (crowi, app) => {
  const Page = crowi.model('Page');
  const actions = {};

  actions.getDatabase = async(req, res) => {
    const user = req.user;

    let path;
    let options;

    try {
      path = req.query.path;
      options = JSON.parse(req.query.options);
    }
    catch (error) {
      return res.status(400).send(error);
    }

    let page;

    try {
      page = await Page.findByPathAndViewer(path, user, null, true);
    }
    catch (err) {
      return res.status(500).send(err);
    }

    if (page == null) {
      return res.status(500).send(new Error('Page is not found'));
    }

    try {
      page.initLatestRevisionField();

      // populate
      page = await page.populateDataToShowRevision();
    }
    catch (err) {
      return res.status(500).send(err);
    }

    let body = page.revision.body;

    // extract
    if (options.extract != null) {
      try {
        const [
          _matchedWhole,
          direction, index, operation, keyword,
        ] = options.extract.match(/^(row|col)#(\d+)([<>]=?|==)(.*)$/);
        logger.warn('_matchedWhole, direction, index, operation, keyword');
        logger.warn(_matchedWhole, direction, index, operation, keyword);
        body = extract(body, direction, index, operation, keyword);
      }
      catch (err) {
        if (err instanceof ExtractOptionError) {
          logger.warn(err);
          return res.status(400).send(err);
        }
      }
    }
    res.status(200).send(body);
  };

  return actions;
};
