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

  getClassesAndStyles() {
    const { refsContext } = this.props;
    const { options } = refsContext;

    const {
      width,
      height,
      'max-width': maxWidth,
      'max-height': maxHeight,
      display = 'block',
      grid,
    } = options;

    let imageClasses = [];
    const anchorStyles = {
      maxWidth, maxHeight,
    };
    const imageStyles = {
      maxWidth, maxHeight,
    };

    // grid mode
    if (grid != null) {
      // fit image to the parent
      imageClasses = imageClasses.concat(['w-100', 'h-100']);
      Object.assign(imageStyles, { objectFit: 'cover' });
      Object.assign(anchorStyles, {
        width: refsContext.getOptGridWidth(),
        height: refsContext.getOptGridHeight(),
      });
    }
    else {
      // set width/height
      Object.assign(anchorStyles, { width, height });
      Object.assign(imageStyles, { width, height });
      // set display
      Object.assign(anchorStyles, { display });
    }


    return {
      imageClasses,
      anchorStyles,
      imageStyles,
    };
  }

  renderExtractedImage(attachment) {
    const { refsContext } = this.props;
    const { options } = refsContext;

    // determine alt
    let alt = refsContext.isSingle ? options.alt : undefined; // use only when single mode
    alt = alt || attachment.originalName; //                     use 'originalName' if options.alt is not specified

    // get styles
    const {
      imageClasses, anchorStyles, imageStyles,
    } = this.getClassesAndStyles();

    return (
      <a key={attachment._id} href="#" style={anchorStyles}>
        <img src={attachment.filePathProxied} alt={alt} className={imageClasses.join(' ')} style={imageStyles} />
      </a>
    );
  }

  render() {
    const { refsContext } = this.props;
    const { grid, 'grid-gap': gridGap } = refsContext.options;

    const contents = this.props.attachments.map((attachment) => {
      const isImage = attachment.fileFormat.startsWith('image/');

      return (isImage)
        ? this.renderExtractedImage(attachment)
        : <AttachmentLink key={attachment._id} attachment={attachment} />;
    });

    const styles = {};

    let gridTemplateColumns;
    if (grid != null) {
      gridTemplateColumns = (refsContext.isOptGridColumnEnabled())
        ? `repeat(${refsContext.getOptGridColumnsNum()}, 1fr)`
        : `repeat(auto-fill, ${refsContext.getOptGridWidth()})`;
      Object.assign(styles, {
        display: 'grid',
        gridTemplateColumns,
        gridAutoRows: '1fr',
        gridGap,
      });
    }

    return (
      <div style={styles}>
        {contents}
      </div>
    );
  }

}

ExtractedAttachments.propTypes = {
  attachments: PropTypes.arrayOf(PropTypes.object).isRequired,
  refsContext: PropTypes.instanceOf(RefsContext).isRequired,
};
