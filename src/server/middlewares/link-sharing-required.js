const loggerFactory = require('@alias/logger');
const ErrorV3 = require('../models/vo/error-apiv3');

const logger = loggerFactory('growi:middleware:link-sharing-required');

module.exports = (crowi) => (req, res, next) => {
    const isLinkSharingDisabled = crowi.configManager.getConfig('crowi', 'security:disableLinkSharing');
    logger.debug(`isLinkSharingDisabled: ${isLinkSharingDisabled}`);

    if (!isLinkSharingDisabled) {
        return res.apiv3Err(new ErrorV3('Link sharing is disabled'));
    }
    next();
}
