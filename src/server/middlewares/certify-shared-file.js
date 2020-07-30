const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:certify-shared-fire');

module.exports = (crowi) => {

  return async(req, res, next) => {

    const fileId = req.params.id || null;

    if (fileId == null) {
      next();
    }

    // No need to check shared page if user exists
    if (req.user != null) {
      next();
    }

    const Attachment = crowi.model('Attachment');
    const ShareLink = crowi.model('ShareLink');

    const attachment = await Attachment.findOne({ _id: fileId });

    if (attachment == null) {
      next();
    }

    const shareLinks = await ShareLink.find({ relatedPage: attachment.page });

    // If sharelinks don't exist, skip it
    if (shareLinks.length === 0) {
      next();
    }

    // Is there a valid share link
    await Promise.all(shareLinks.map((sharelink) => {
      if (!sharelink.isExpired()) {
        logger.debug('Confirmed target file belong to a share page');
        req.isSharedPage = true;
      }
      return;
    }));

    next();
  };

};
