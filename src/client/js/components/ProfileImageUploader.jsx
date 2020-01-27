import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';
import { withTranslation } from 'react-i18next';
import ReactCrop from 'react-image-crop';
import AppContainer from '../services/AppContainer';
import { createSubscribedElement } from './UnstatedUtils';
import 'react-image-crop/dist/ReactCrop.css';

class ProfileImageUploader extends React.Component {

  // demo: https://codesandbox.io/s/72py4jlll6
  constructor(props) {
    super();
    this.state = {
      show: false,
      src: null,
      crop: null,
      croppedImageUrl: null,
    };
    this.onSelectFile = this.onSelectFile.bind(this);
    this.onImageLoaded = this.onImageLoaded.bind(this);
    this.onCropChange = this.onCropChange.bind(this);
    this.getCroppedImg = this.getCroppedImg.bind(this);
    this.crop = this.crop.bind(this);
    this.cancel = this.cancel.bind(this);
    this.reset = this.reset.bind(this);
  }

  onSelectFile(e) {
    console.log(e);
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => this.setState({ src: reader.result }));
      reader.readAsDataURL(e.target.files[0]);
      this.show();
    }
  }

  onImageLoaded(image) {
    this.imageRef = image;
    this.reset();
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
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, 'image/jpeg');
    });
  }

  async crop() {
    // crop immages
    if (this.imageRef && this.state.crop.width && this.state.crop.height) {
      const croppedImageUrl = await this.getCroppedImg(this.imageRef, this.state.crop, '/images/icons/user');
      this.setState({ croppedImageUrl });
    }
    this.hide();
  }

  show() {
    this.setState({ show: true });
  }

  hide() {
    this.setState({
      show: false,
    });
  }

  cancel() {
    this.hide();
  }

  reset() {
    const size = Math.min(this.imageRef.width, this.imageRef.height);
    this.setState({
      crop: {
        unit: 'px',
        x: this.imageRef.width / 2 - size / 2,
        y: this.imageRef.height / 2 - size / 2,
        width: size,
        height: size,
        aspect: 1,
      },
    });
  }

  render() {
    const { t } = this.props;
    const { crop, src, croppedImageUrl } = this.state;
    return (
      <div className="ProfileImageUploader">
        <div className="form-group">
          <label htmlFfor="" className="col-sm-4 control-label">
            {t('Upload new image')}
          </label>
        </div>
        <div className="col-sm-8">
          {croppedImageUrl && (
            <img src={croppedImageUrl} className="picture picture-lg img-circle" id="settingUserPicture" />
          )}
          <input type="file" onChange={this.onSelectFile} name="profileImage" accept="image/*" />
          <Modal show={this.state.show} onHide={this.cancel}>
            <Modal.Header closeButton>
              <Modal.Title>Image Crop</Modal.Title>
            </Modal.Header>
            <Modal.Body className="my-4">
              <ReactCrop src={src} crop={crop} circularCrop onImageLoaded={this.onImageLoaded} onChange={this.onCropChange} />
            </Modal.Body>
            <Modal.Footer>
              <div className="d-flex justify-content-between">
                <Button bsStyle="danger" onClick={this.reset}>
                  Reset
                </Button>
                <div className="d-flex">
                  <Button bsStyle="default" onClick={this.cancel}>
                    Cancel
                  </Button>
                  <Button bsStyle="primary" onClick={this.crop}>
                    Crop
                  </Button>
                </div>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ProfileImageFormWrapper = (props) => {
  return createSubscribedElement(ProfileImageUploader, props, [AppContainer]);
};
ProfileImageUploader.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};
export default withTranslation()(ProfileImageFormWrapper);
