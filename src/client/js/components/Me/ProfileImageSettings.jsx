import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import md5 from 'md5';

import { toastSuccess, toastError } from '../../util/apiNotification';
import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

import ImageCropModal from './ImageCropModal';

class ProfileImageSettings extends React.Component {

  constructor(appContainer) {
    super();

    this.state = {
      show: false,
      src: null,
    };

    this.imageRef = null;
    this.onSelectFile = this.onSelectFile.bind(this);
    this.onClickDeleteBtn = this.onClickDeleteBtn.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.cancelModal = this.cancelModal.bind(this);
    this.onCropCompleted = this.onCropCompleted.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, personalContainer } = this.props;

    try {
      await personalContainer.updateProfileImage();
      toastSuccess(t('toaster.update_successed', { target: t('Set Profile Image') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  generateGravatarSrc() {
    const email = this.props.personalContainer.state.email || '';
    const hash = md5(email.trim().toLowerCase());
    return `https://gravatar.com/avatar/${hash}`;
  }

  onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => this.setState({ src: reader.result }));
      reader.readAsDataURL(e.target.files[0]);
      this.setState({ show: true });
    }
  }

  /**
   * @param {object} croppedImage cropped profile image for upload
   */
  async onCropCompleted(croppedImage) {
    const { t, personalContainer } = this.props;
    try {
      await personalContainer.uploadAttachment(croppedImage);
      toastSuccess(t('toaster.update_successed', { target: t('Current Image') }));
    }
    catch (err) {
      toastError(err);
    }
    this.hideModal();
  }

  async onClickDeleteBtn() {
    const { t, personalContainer } = this.props;
    try {
      await personalContainer.deleteProfileImage();
      toastSuccess(t('toaster.update_successed', { target: t('Current Image') }));
    }
    catch (err) {
      toastError(err);
    }
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
    const { t, personalContainer } = this.props;
    const { uploadedPictureSrc, isGravatarEnabled, isUploadedPicture } = personalContainer.state;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-3 offset-1 col-sm-4">
            <h4>
              <div className="custom-control custom-radio radio-primary">
                <input
                  type="radio"
                  id="radioGravatar"
                  className="custom-control-input"
                  form="formImageType"
                  name="imagetypeForm[isGravatarEnabled]"
                  checked={isGravatarEnabled}
                  onChange={() => { personalContainer.changeIsGravatarEnabled(true) }}
                />
                <label className="custom-control-label" htmlFor="radioGravatar">
                  <img src="https://gravatar.com/avatar/00000000000000000000000000000000?s=24" /> Gravatar
                </label>
                <a href="https://gravatar.com/">
                  <small><i className="icon-arrow-right-circle" aria-hidden="true"></i></small>
                </a>
              </div>
            </h4>

            <img src={this.generateGravatarSrc()} width="64" />
          </div>

          <div className="col-md-3 offset-1 col-sm-4">
            <h4>
              <div className="custom-control custom-radio radio-primary">
                <input
                  type="radio"
                  id="radioUploadPicture"
                  className="custom-control-input"
                  form="formImageType"
                  name="imagetypeForm[isGravatarEnabled]"
                  checked={!isGravatarEnabled}
                  onChange={() => { personalContainer.changeIsGravatarEnabled(false) }}
                />
                <label className="custom-control-label" htmlFor="radioUploadPicture">
                  { t('Upload Image') }
                </label>
              </div>
            </h4>
            <div className="row mb-3">
              <label className="col-sm-4 col-12 col-form-label text-left">
                { t('Current Image') }
              </label>
              <div className="col-sm-8 col-12">
                {uploadedPictureSrc && (<p><img src={uploadedPictureSrc} className="picture picture-lg rounded-circle" id="settingUserPicture" /></p>)}
                {isUploadedPicture && <button type="button" className="btn btn-danger" onClick={this.onClickDeleteBtn}>{ t('Delete Image') }</button>}
              </div>
            </div>
            <div className="row">
              <label className="col-sm-4 col-12 col-form-label text-left">
                {t('Upload new image')}
              </label>
              <div className="col-sm-8 col-12">
                <input type="file" onChange={this.onSelectFile} name="profileImage" accept="image/*" />
              </div>
            </div>
          </div>
        </div>

        <ImageCropModal
          show={this.state.show}
          src={this.state.src}
          onModalClose={this.cancelModal}
          onCropCompleted={this.onCropCompleted}
        />

        <div className="row my-3">
          <div className="offset-4 col-5">
            <button type="button" className="btn btn-primary" onClick={this.onClickSubmit} disabled={personalContainer.state.retrieveError != null}>
              {t('Update')}
            </button>
          </div>
        </div>

      </React.Fragment>
    );
  }

}


const ProfileImageSettingsWrapper = (props) => {
  return createSubscribedElement(ProfileImageSettings, props, [AppContainer, PersonalContainer]);
};

ProfileImageSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(ProfileImageSettingsWrapper);
