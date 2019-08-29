import React from 'react';
import PropTypes from 'prop-types';

import Attachment from '@client/js/components/PageAttachment/Attachment';

const AttachmentLink = Attachment;

/**
 *  1. when 'fileFormat' is image, render Attachment as an image
 *  2. when 'fileFormat' is not image, render Attachment as an Attachment component
 */
export default class AttachmentExtracted extends React.PureComponent {

  render() {
    const { attachment } = this.props;

    const isImage = attachment.fileFormat.startsWith('image/');

    return (isImage)
      ? <div><a href="#"><img src={attachment.filePathProxied} alt={attachment.originalName} /></a></div>
      : <AttachmentLink key={attachment._id} attachment={attachment} />;
  }

}

AttachmentExtracted.propTypes = {
  attachment: PropTypes.object.isRequired,
};
