import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';
import { withTranslation } from 'react-i18next';
import ReactCrop from 'react-image-crop';
import AppContainer from '../../services/AppContainer';
import { createSubscribedElement } from '../UnstatedUtils';
import 'react-image-crop/dist/ReactCrop.css';

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
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
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
      <Modal show={this.props.show} onHide={this.props.onModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Image Crop</Modal.Title>
        </Modal.Header>
        <Modal.Body className="my-4">
          <ReactCrop
            circularCrop
            src={this.props.src}
            crop={this.state.crop}
            onImageLoaded={this.onImageLoaded}
            onChange={this.onCropChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between">
            <Button bsStyle="danger" onClick={this.reset}>
              Reset
            </Button>
            <div className="d-flex">
              <Button bsStyle="default" onClick={this.props.onModalClose}>
                Cancel
              </Button>
              <Button bsStyle="primary" onClick={this.crop}>
                Crop
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ProfileImageFormWrapper = (props) => {
  return createSubscribedElement(ImageCropModal, props, [AppContainer]);
};
ImageCropModal.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  show: PropTypes.bool.isRequired,
  src: PropTypes.string,
  onModalClose: PropTypes.func.isRequired,
  onCropCompleted: PropTypes.func.isRequired,
};
export default withTranslation()(ProfileImageFormWrapper);
