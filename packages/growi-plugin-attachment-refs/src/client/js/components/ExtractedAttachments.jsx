import React from 'react';
import PropTypes from 'prop-types';

import RefsContext from '../util/RefsContext';

/**
 *  1. when 'fileFormat' is image, render Attachment as an image
 *  2. when 'fileFormat' is not image, render Attachment as an Attachment component
 */
export default class ExtractedAttachments extends React.PureComponent {

  getClassesAndStylesForNonGrid() {
    const { refsContext } = this.props;
    const { options } = refsContext;

    const {
      width,
      height,
      'max-width': maxWidth,
      'max-height': maxHeight,
      display = 'block',
    } = options;

    const anchorStyles = {
      width, height, maxWidth, maxHeight, display,
    };

    const imageClasses = [];
    const imageStyles = {
      width, height, maxWidth, maxHeight,
    };

    return {
      imageClasses,
      anchorStyles,
      imageStyles,
    };
  }

  getClassesAndStylesForGrid() {
    const { refsContext } = this.props;
    const { options } = refsContext;

    const {
      'max-width': maxWidth,
      'max-height': maxHeight,
    } = options;

    const anchorStyles = {
      width: refsContext.getOptGridWidth(),
      height: refsContext.getOptGridHeight(),
      maxWidth,
      maxHeight,
    };

    const imageClasses = ['w-100', 'h-100'];
    const imageStyles = {
      objectFit: 'cover',
      maxWidth,
      maxHeight,
    };

    return {
      imageClasses,
      anchorStyles,
      imageStyles,
    };
  }

  /**
   * wrapper method for getClassesAndStylesForGrid/getClassesAndStylesForNonGrid
   */
  getClassesAndStyles() {
    const { refsContext } = this.props;
    const { options } = refsContext;

    return (options.grid != null)
      ? this.getClassesAndStylesForGrid()
      : this.getClassesAndStylesForNonGrid();
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
    const { options } = refsContext;
    const { grid, 'grid-gap': gridGap } = options;

    const styles = {};

    // Grid mode
    if (grid != null) {

      const gridTemplateColumns = (refsContext.isOptGridColumnEnabled())
        ? `repeat(${refsContext.getOptGridColumnsNum()}, 1fr)`
        : `repeat(auto-fill, ${refsContext.getOptGridWidth()})`;

      Object.assign(styles, {
        display: 'grid',
        gridTemplateColumns,
        gridAutoRows: '1fr',
        gridGap,
      });

    }

    const contents = this.props.attachments
      .filter(attachment => attachment.fileFormat.startsWith('image/'))
      .map(attachment => this.renderExtractedImage(attachment));

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
