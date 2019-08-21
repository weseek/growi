const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi-plugin:attachment-refs:routes:refs');

module.exports = (crowi) => {
  const express = crowi.require('express');
  const router = express.Router();

  const User = crowi.model('User');
  const Page = crowi.model('Page');
  const Attachment = crowi.model('Attachment');

  /**
   * return an Attachment model
   */
  router.get('/ref', async(req, res) => {
    const user = req.user;
    const { pagePath, fileName } = req.query;
    // const options = JSON.parse(req.query.options);

    if (pagePath == null) {
      res.status(400).send('the param \'pagePath\' must be set.');
      return;
    }

    try {
      const attachment = await Attachment.findOne({ originalName: fileName })
        .populate({ path: 'creator', select: User.USER_PUBLIC_FIELDS, populate: User.IMAGE_POPULATION });

      // not found
      if (attachment == null) {
        res.status(404).send(`fileName: '${fileName}' is not found.`);
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
    }
    catch (err) {
      logger.error(err);
      res.status(503).send({ err });
    }
  });

  return router;
};
