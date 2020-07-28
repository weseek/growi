const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:certify-shared-fire');

module.exports = (crowi) => {

  return async(req, res, next) => {
    // TODO
    // const pageId = req.query.page_id || req.body.page_id || null;
    // const shareLinkId = req.query.share_link_id || req.body.share_link_id || null;
    // if (pageId == null || shareLinkId == null) {
    //   return next();
    // }

    // const ShareLink = crowi.model('ShareLink');
    // const sharelink = await ShareLink.findOne({ _id: shareLinkId, relatedPage: pageId });

    // // check sharelink enabled
    // if (sharelink == null || sharelink.isExpired()) {
    //   return next();
    // }

    // logger.debug('shareLink id is', sharelink._id);

    // req.isSharedPage = true;

    // logger.debug('Confirmed target page id is a share page');

    next();
  };

};
