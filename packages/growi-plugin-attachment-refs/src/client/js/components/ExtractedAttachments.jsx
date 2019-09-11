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

  /**
   * Splits an array into an array of smaller arrays containing `chunkSize` members
   * @see https://gist.github.com/webinista/11240585#gistcomment-1421302
   * @param {Array} array
   * @param {number} chunkSize
   */
  splitToChunks(array, chunkSize) {
    const sets = [];
    const chunks = array.length / chunkSize;

    for (let i = 0, j = 0; i < chunks; i++, j += chunkSize) {
      sets[i] = array.slice(j, j + chunkSize);
    }

    return sets;
  }

  getClassesAndStyles() {
    const { refsContext } = this.props;
    const { options } = refsContext;

    const {
      width,
      height,
      'max-width': maxWidth,
      'max-height': maxHeight,
      display = 'block',
    } = options;

    let anchorClasses = [];
    let imageClasses = [];
    const anchorStyles = {
      width, height, maxWidth, maxHeight,
    };
    const imageStyles = {
      height, maxHeight,
    };

    const columnSize = refsContext.getOptColumnSize();
    // grid mode
    if (columnSize != null) {
      anchorClasses = anchorClasses.concat([`col-sm-${columnSize}`]);
      // fit image to the parent
      imageClasses = imageClasses.concat(['w-100']);
      Object.assign(imageStyles, { objectFit: 'cover' });
    }
    else {
      // init width/maxWidth
      Object.assign(imageStyles, { width, maxWidth });
    }

    Object.assign(anchorStyles, { display });

    return {
      anchorClasses,
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
      anchorClasses, imageClasses, anchorStyles, imageStyles,
    } = this.getClassesAndStyles();

    return (
      <a key={attachment._id} href="#" className={anchorClasses.join(' ')} style={anchorStyles}>
        <img src={attachment.filePathProxied} alt={alt} className={imageClasses.join(' ')} style={imageStyles} />
      </a>
    );
  }

  render() {
    const { refsContext } = this.props;

    const contents = this.props.attachments.map((attachment) => {
      const isImage = attachment.fileFormat.startsWith('image/');

      return (isImage)
        ? this.renderExtractedImage(attachment)
        : <AttachmentLink key={attachment._id} attachment={attachment} />;
    });

    const columnSize = refsContext.getOptColumnSize();
    let contentChunks; // [[c1, c2, c3], [c4, c5, c6], ...]
    if (columnSize != null) {
      contentChunks = this.splitToChunks(contents, 12 / columnSize);
    }
    else {
      contentChunks = [contents];
    }

    return contentChunks.map((chunk, index) => {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`row-chunk-${index}`} className="row mt-5">
          {chunk}
        </div>
      );
    });
  }

}

ExtractedAttachments.propTypes = {
  attachments: PropTypes.arrayOf(PropTypes.object).isRequired,
  refsContext: PropTypes.instanceOf(RefsContext).isRequired,
};
