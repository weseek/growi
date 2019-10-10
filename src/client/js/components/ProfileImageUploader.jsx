import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ReactCrop from 'react-image-crop';
import AppContainer from '../services/AppContainer';
import { createSubscribedElement } from './UnstatedUtils';
import 'react-image-crop/dist/ReactCrop.css';

class ProfileImageUploader extends React.Component {

  constructor(props) {
    super();

    this.state = {
      src: null,
      crop: {
        unit: '%',
        width: 30,
        aspect: 1,
      },
    };

    this.onSelectFile = this.onSelectFile.bind(this);
    this.onImageLoaded = this.onImageLoaded.bind(this);
    this.onCropComplete = this.onCropComplete.bind(this);
    this.onCropChange = this.onCropChange.bind(this);
    this.makeClientCrop = this.makeClientCrop.bind(this);
    this.getCroppedImg = this.getCroppedImg.bind(this);
    this.hanndleSubmit = this.handleSubmit.bind(this);
  }

  onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => this.setState({ src: reader.result }));
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  // If you setState the crop in here you should return false.
  onImageLoaded(image) {
    this.imageRef = image;
  }

  onCropComplete(crop) {
    this.makeClientCrop(crop);
  }

  onCropChange(crop, percentCrop) {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    this.setState({ crop });
  }

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(this.imageRef, crop, 'newFile.jpeg');
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
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

  handleSubmit() {
    // GW-201 にて、crop された画像をサーバー側に送る処理を記述する
    // me/index.html の 199~240行目の
    // `$("#pictureUploadForm input[name=profileImage]").on('change', function(){...}`
    // の処理を node で記述
  }

  render() {
    const { crop, croppedImageUrl, src } = this.state;

    return (
      <div className="App">
        <input type="file" onChange={this.onSelectFile} name="profileImage" accept="image/*" />
        {src
        && (
        <div>
          <ReactCrop
            src={src}
            crop={crop}
            onImageLoaded={this.onImageLoaded}
            onComplete={this.onCropComplete}
            onChange={this.onCropChange}
          />
          <button
            type="button"
            onClick={this.handleSubmit}
          >
          完了
          </button>
        </div>
        )}
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
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ProfileImageFormWrapper);
