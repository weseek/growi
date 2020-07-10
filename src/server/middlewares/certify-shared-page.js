const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:certify-shared-page');

module.exports = (crowi) => {

  return async(req, res, next) => {
    const pageId = req.query.page_id || req.body.page_id || null;
    if (pageId == null) {
      return next();
    }

    const ShareLink = crowi.model('ShareLink');
    const sharelink = await ShareLink.findOne({ relatedPage: pageId });

    // check sharelink enabled
    if (sharelink == null || sharelink.isExpired()) {
      return next();
    }

    logger.debug('shareLink id is', sharelink._id);

    req.isSharedPage = true;

    logger.debug('Confirmed target page id is a share page');

    next();
  };

};
