const loggerFactory = require('@alias/logger');
const url = require('url');

const logger = loggerFactory('growi:middleware:certify-shared-fire');

module.exports = (crowi) => {

  return async(req, res, next) => {
    const { referer } = req.headers;
    const { path } = url.parse(referer);

    if (!path.startsWith('/share/')) {
      return next();
    }

    const fileId = req.params.id || null;

    const Attachment = crowi.model('Attachment');
    const ShareLink = crowi.model('ShareLink');

    const attachment = await Attachment.findOne({ _id: fileId });

    if (attachment == null) {
      return next();
    }

    const shareLinks = await ShareLink.find({ relatedPage: attachment.page });

    // If sharelinks don't exist, skip it
    if (shareLinks.length === 0) {
      return next();
    }

    // Is there a valid share link
    shareLinks.map((sharelink) => {
      if (!sharelink.isExpired()) {
        logger.debug('Confirmed target file belong to a share page');
        req.isSharedPage = true;
      }
      return;
    });

    next();
  };

};
