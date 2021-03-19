import loggerFactory from '~/utils/logger';

import Attachment from '~/server/models/attachment';
import ShareLink from '~/server/models/share-link';

const url = require('url');

const logger = loggerFactory('growi:middleware:certify-shared-fire');

module.exports = () => {

  return async(req, res, next) => {
    const { referer } = req.headers;

    // Attachments cannot be viewed by clients who do not send referer.
    // https://github.com/weseek/growi/issues/2819
    if (referer == null) {
      return next();
    }

    const { path } = url.parse(referer);

    if (!path.startsWith('/share/')) {
      return next();
    }

    const fileId = req.params.id || null;

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
