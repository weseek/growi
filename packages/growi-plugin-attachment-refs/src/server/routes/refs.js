const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi-plugin:attachment-refs:routes:refs');

module.exports = (crowi) => {
  const express = crowi.require('express');
  const router = express.Router();

  const User = crowi.model('User');
  const Page = crowi.model('Page');
  const Attachment = crowi.model('Attachment');

  const { PageQueryBuilder } = Page;

  /**
   * generate RegExp instance by the 'expression' arg
   * @param {string} expression
   * @return {RegExp}
   */
  function generateRegexp(expression) {
    // https://regex101.com/r/uOrwqt/2
    const matches = expression.match(/^\/(.+)\/(.*)?$/);

    return (matches != null)
      ? new RegExp(matches[1], matches[2])
      : new RegExp(expression);
  }

  /**
   * return an Attachment model
   */
  router.get('/ref', async(req, res) => {
    const user = req.user;
    const { pagePath, fileName } = req.query;
    // eslint-disable-next-line no-unused-vars
    const options = JSON.parse(req.query.options);

    if (pagePath == null) {
      res.status(400).send('the param \'pagePath\' must be set.');
      return;
    }

    const page = await Page.findByPathAndViewer(pagePath, user);

    // not found
    if (page == null) {
      res.status(404).send(`pagePath: '${pagePath}' is not found or forbidden.`);
      return;
    }

    const attachment = await Attachment
      .findOne({
        page: page._id,
        originalName: fileName,
      })
      .populate({ path: 'creator', select: User.USER_PUBLIC_FIELDS, populate: User.IMAGE_POPULATION });

    // not found
    if (attachment == null) {
      res.status(404).send(`attachment (fileName: '${fileName}') is not found.`);
      return;
    }

    logger.debug(`attachment '${attachment.id}' is found from filename '${fileName}'`);

    // forbidden
    const isAccessible = await Page.isAccessiblePageByViewer(attachment.page, user);
    if (!isAccessible) {
      logger.debug(`attachment '${attachment.id}' is forbidden for user '${user && user.username}'`);
      res.status(403).send(`page '${attachment.page}' is forbidden.`);
      return;
    }

    res.status(200).send({ attachment });
  });

  /**
   * return a list of Attachment
   */
  router.get('/refs', async(req, res) => {
    const user = req.user;
    const { prefix, pagePath } = req.query;
    const options = JSON.parse(req.query.options);

    // check either 'prefix' or 'pagePath ' is specified
    if (prefix == null && pagePath == null) {
      res.status(400).send('either the param \'prefix\' or \'pagePath\' must be set.');
      return;
    }

    // check regex
    let regex;
    const regexOptionValue = options.regexp || options.regex;
    if (regexOptionValue != null) {
      try {
        regex = generateRegexp(regexOptionValue);
      }
      catch (err) {
        res.status(400).send(`the 'regex=${options.regex}' option is invalid as RegExp.`);
        return;
      }
    }

    const builder = new PageQueryBuilder(Page.find());
    builder.addConditionToListWithDescendants(prefix || pagePath)
      .addConditionToExcludeTrashed()
      .addConditionToExcludeRedirect();

    Page.addConditionToFilteringByViewerForList(builder, user, false);

    const results = await builder.query.select('id').exec();
    const pageIds = results.map(result => result.id);

    logger.debug('retrieve attachments for pages:', pageIds);

    // create query to find
    let query = Attachment
      .find({
        page: { $in: pageIds },
      });
    // add regex condition
    if (regex != null) {
      query = query.and({
        originalName: { $regex: regex },
      });
    }

    const attachments = await query
      .populate({ path: 'creator', select: User.USER_PUBLIC_FIELDS, populate: User.IMAGE_POPULATION })
      .exec();

    res.status(200).send({ attachments });
  });

  return router;
};
