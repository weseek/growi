import { AttachmentType } from '~/server/interfaces/attachment';

module.exports = (crowi) => {

  return async(req, res, next) => {

    const Attachment = crowi.model('Attachment');
    const attachment = await Attachment.findOne({ attachmentType: AttachmentType.BRAND_LOGO });

    if (attachment != null) {
      req.isBrandLogo = true;
    }

    next();
  };

};
