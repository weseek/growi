import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';
import canvasToBlob from 'async-canvas-to-blob';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { withTranslation } from 'react-i18next';
import ReactCrop from 'react-image-crop';
import AppContainer from '../../services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import 'react-image-crop/dist/ReactCrop.css';
import { toastError } from '../../util/apiNotification';

const logger = loggerFactory('growi:ImageCropModal');

class ImageCropModal extends React.Component {

  // demo: https://codesandbox.io/s/72py4jlll6
  constructor(props) {
    super();
    this.state = {
      crop: null,
      imageRef: null,
    };
    this.onImageLoaded = this.onImageLoaded.bind(this);
    this.onCropChange = this.onCropChange.bind(this);
    this.getCroppedImg = this.getCroppedImg.bind(this);
    this.crop = this.crop.bind(this);
    this.reset = this.reset.bind(this);
    this.imageRef = null;
  }

  onImageLoaded(image) {
    this.setState({ imageRef: image }, () => this.reset());
    return false; // Return false when setting crop state in here.
  }

  onCropChange(crop) {
    this.setState({ crop });
  }

  async getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    try {
      const blob = await canvasToBlob(canvas);
      return blob;
    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to draw image'));
    }
  }

  async crop() {
    // crop immages
    if (this.state.imageRef && this.state.crop.width && this.state.crop.height) {
      const croppedImage = await this.getCroppedImg(this.state.imageRef, this.state.crop, '/images/icons/user');
      this.props.onCropCompleted(croppedImage);
    }
  }

  reset() {
    const size = Math.min(this.state.imageRef.width, this.state.imageRef.height);
    this.setState({
      crop: {
        aspect: 1,
        unit: 'px',
        x: this.state.imageRef.width / 2 - size / 2,
        y: this.state.imageRef.height / 2 - size / 2,
        width: size,
        height: size,
      },
    });
  }

  render() {
    return (
      <Modal isOpen={this.props.show} toggle={this.props.onModalClose}>
        <ModalHeader tag="h4" toggle={this.props.onModalClose} className="bg-info text-light">
          Image Crop
        </ModalHeader>
        <ModalBody className="my-4">
          <ReactCrop circularCrop src={this.props.src} crop={this.state.crop} onImageLoaded={this.onImageLoaded} onChange={this.onCropChange} />
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-outline-danger rounded-pill mr-auto" onClick={this.reset}>
              Reset
          </button>
          <button type="button" className="btn btn-outline-secondary rounded-pill mr-2" onClick={this.props.onModalClose}>
                  Cancel
          </button>
          <button type="button" className="btn btn-outline-primary rounded-pill" onClick={this.crop}>
                  Crop
          </button>
        </ModalFooter>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ProfileImageFormWrapper = withUnstatedContainers(ImageCropModal, [AppContainer]);
ImageCropModal.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  show: PropTypes.bool.isRequired,
  src: PropTypes.string,
  onModalClose: PropTypes.func.isRequired,
  onCropCompleted: PropTypes.func.isRequired,
};
export default withTranslation()(ProfileImageFormWrapper);
