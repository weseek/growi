import React from 'react';
import PropTypes from 'prop-types';

import Attachment from '@client/js/components/PageAttachment/Attachment';

import RefsContext from '../util/RefsContext';

const AttachmentLink = Attachment;

/**
 *  1. when 'fileFormat' is image, render Attachment as an image
 *  2. when 'fileFormat' is not image, render Attachment as an Attachment component
 */
export default class ExtractedAttachments extends React.PureComponent {

  renderExtractedImage(attachment, styles) {
    const { refsContext } = this.props;
    const { options } = refsContext;

    // determine alt
    let alt = refsContext.isSingle ? options.alt : undefined; // use only when single mode
    alt = alt || attachment.originalName; //                     use 'originalName' if options.alt is not specified

    return (
      <a key={attachment._id} href="#" style={styles}>
        <img src={attachment.filePathProxied} alt={alt} style={styles} />
      </a>
    );
  }

  render() {
    const { refsContext } = this.props;
    const { options } = refsContext;

    const {
      width,
      height,
      'max-width': maxWidth,
      'max-height': maxHeight,
    } = options;

    const styles = {
      width, height, maxWidth, maxHeight, display: 'block',
    };

    return this.props.attachments.map((attachment) => {
      const isImage = attachment.fileFormat.startsWith('image/');

      return (isImage)
        ? this.renderExtractedImage(attachment, styles)
        : <AttachmentLink key={attachment._id} attachment={attachment} />;
    });
  }

}

ExtractedAttachments.propTypes = {
  attachments: PropTypes.arrayOf(PropTypes.object).isRequired,
  refsContext: PropTypes.instanceOf(RefsContext).isRequired,
};
