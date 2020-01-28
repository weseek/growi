import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import AppContainer from '../../services/AppContainer';
import { createSubscribedElement } from '../UnstatedUtils';
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropModal from './ImageCropModal';

class ProfileImageUploader extends React.Component {

  constructor(props) {
    super();
    this.state = {
      show: false,
      src: null,
      croppedImageUrl: null,
    };
    this.imageRef = null;
    this.onSelectFile = this.onSelectFile.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.cancelModal = this.cancelModal.bind(this);
  }

  onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => this.setState({ src: reader.result }));
      reader.readAsDataURL(e.target.files[0]);
    }
    this.setState({ show: true });
  }

  setCroppedImageUrl(croppedImageUrl) {
    this.setState({ croppedImageUrl });
  }

  setImageRef(image) {
    console.log(image);
    this.imageRef = image;
  }

  showModal() {
    this.setState({ show: true });
  }

  hideModal() {
    this.setState({ show: false });
  }

  cancelModal() {
    this.hideModal();
  }

  render() {
    const { t } = this.props;
    const { croppedImageUrl } = this.state;
    return (
      <div className="ProfileImageUploader">
        <div className="form-group">
          <label className="col-sm-4 control-label">
            {t('Upload new image')}
          </label>
        </div>
        <div className="col-sm-8">
          {croppedImageUrl && (
            <img src={croppedImageUrl} className="picture picture-lg img-circle" id="settingUserPicture" />
          )}
          <input type="file" onChange={this.onSelectFile} name="profileImage" accept="image/*" />
          <ImageCropModal
            show={this.state.show}
            src={this.state.src}
            imageRef={this.imageRef}
            setImageRef={this.setImageRef}
            hideModal={this.hideModal}
            cancelModal={this.cancelModal}
            setCroppedImageUrl={this.setCroppedImageUrl}
          />
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
