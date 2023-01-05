import React from 'react';

import PropTypes from 'prop-types';
import Carousel, { Modal, ModalGateway } from 'react-images';

import RefsContext from '../util/RefsContext';

/**
 *  1. when 'fileFormat' is image, render Attachment as an image
 *  2. when 'fileFormat' is not image, render Attachment as an Attachment component
 */
export default class ExtractedAttachments extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      showCarousel: false,
      currentIndex: null,
    };
  }

  imageClickedHandler(index) {
    this.setState({
      showCarousel: true,
      currentIndex: index,
    });
  }

  getAttachmentsFilteredByFormat() {
    return this.props.attachments
      .filter(attachment => attachment.fileFormat.startsWith('image/'));
  }

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

    const containerStyles = {
      width, height, maxWidth, maxHeight, display,
    };

    const imageClasses = [];
    const imageStyles = {
      width, height, maxWidth, maxHeight,
    };

    return {
      containerStyles,
      imageClasses,
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

    const containerStyles = {
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
      containerStyles,
      imageClasses,
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

  renderExtractedImage(attachment, index) {
    const { refsContext } = this.props;
    const { options } = refsContext;

    // determine alt
    let alt = refsContext.isSingle ? options.alt : undefined; // use only when single mode
    alt = alt || attachment.originalName; //                     use 'originalName' if options.alt is not specified

    // get styles
    const {
      containerStyles, imageClasses, imageStyles,
    } = this.getClassesAndStyles();

    // carousel settings
    let onClick;
    if (options['no-carousel'] == null) {
      // pointer cursor
      Object.assign(containerStyles, { cursor: 'pointer' });
      // set click handler
      onClick = () => {
        this.imageClickedHandler(index);
      };
    }

    return (
      <div key={attachment._id} style={containerStyles} onClick={onClick}>
        <img src={attachment.filePathProxied} alt={alt} className={imageClasses.join(' ')} style={imageStyles} />
      </div>
    );
  }

  renderCarousel() {
    const { options } = this.props.refsContext;
    const withCarousel = options['no-carousel'] == null;

    const { showCarousel, currentIndex } = this.state;

    const images = this.getAttachmentsFilteredByFormat()
      .map((attachment) => {
        return { src: attachment.filePathProxied };
      });

    // overwrite react-images modal styles
    const zIndex = 1030; // > grw-navbar
    const modalStyles = {
      blanket: (styleObj) => {
        return Object.assign(styleObj, { zIndex });
      },
      positioner: (styleObj) => {
        return Object.assign(styleObj, { zIndex });
      },
    };

    return (
      <ModalGateway>
        { withCarousel && showCarousel && (
          <Modal styles={modalStyles} onClose={() => { this.setState({ showCarousel: false }) }}>
            <Carousel views={images} currentIndex={currentIndex} />
          </Modal>
        ) }
      </ModalGateway>
    );
  }

  render() {
    const { refsContext } = this.props;
    const { options } = refsContext;
    const {
      grid,
      'grid-gap': gridGap,
    } = options;

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

    const contents = this.getAttachmentsFilteredByFormat()
      .map((attachment, index) => this.renderExtractedImage(attachment, index));

    return (
      <React.Fragment>
        <div style={styles}>
          {contents}
        </div>

        { this.renderCarousel() }
      </React.Fragment>
    );
  }

}

ExtractedAttachments.propTypes = {
  attachments: PropTypes.arrayOf(PropTypes.object).isRequired,
  refsContext: PropTypes.instanceOf(RefsContext).isRequired,
};
