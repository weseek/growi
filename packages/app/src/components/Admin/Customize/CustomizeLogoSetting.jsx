import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import AppContainer from '~/client/services/AppContainer';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CropLogoModal from './CropLogoModal';

class CustomizeLogoSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      src: null,
    };

    // this.imageRef = null;
    this.onSelectFile = this.onSelectFile.bind(this);
    this.onClickDeleteBtn = this.onClickDeleteBtn.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.cancelModal = this.cancelModal.bind(this);
    this.onCropCompleted = this.onCropCompleted.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => this.setState({ src: reader.result }));
      reader.readAsDataURL(e.target.files[0]);
      this.setState({ show: true });
    }
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeLogo();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.custom_script') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  async onClickDeleteBtn() {
    const { t, adminCustomizeContainer } = this.props;
    try {
      await adminCustomizeContainer.deleteLogo();
      toastSuccess(t('toaster.update_successed', { target: t('Current Image') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  async onCropCompleted(croppedImage) {
    const { t, adminCustomizeContainer } = this.props;
    try {
      await adminCustomizeContainer.uploadAttachment(croppedImage);
      toastSuccess(t('toaster.update_successed', { target: t('Current Image') }));
    }
    catch (err) {
      toastError(err);
    }
    this.hideModal();
  }


  hideModal() {
    this.setState({ show: false });
  }

  cancelModal() {
    this.hideModal();
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;
    const {
      uploadedLogoSrc, isUploadedLogo, isDefaultLogo, defaultLogoSrc,
    } = adminCustomizeContainer.state;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12">
            <h2 className="admin-setting-header">{t('admin:customize_setting.custom_script')}</h2>
            <div className="row">
              <div className="col-md-6 col-12">
                <h4>
                  <div className="custom-control custom-radio radio-primary">
                    <input
                      type="radio"
                      id="radioDefaultLogo"
                      className="custom-control-input"
                      form="formImageType"
                      name="imagetypeForm[isDefaultLogo]"
                      checked={isDefaultLogo}
                      onChange={() => { adminCustomizeContainer.switchDefaultLogo() }}
                    />
                    <label className="custom-control-label" htmlFor="radioDefaultLogo">
                      Default Logo
                    </label>
                  </div>
                </h4>
                <img src={defaultLogoSrc} width="64" />
              </div>
              <div className="col-md-6 col-12">
                <h4>
                  <div className="custom-control custom-radio radio-primary">
                    <input
                      type="radio"
                      id="radioUploadLogo"
                      className="custom-control-input"
                      form="formImageType"
                      name="imagetypeForm[isDefaultLogo]"
                      checked={!isDefaultLogo}
                      onChange={() => { adminCustomizeContainer.switchDefaultLogo() }}
                    />
                    <label className="custom-control-label" htmlFor="radioUploadLogo">
                      { t('Upload Logo') }
                    </label>
                  </div>
                </h4>
                <div className="row mb-3">
                  <label className="col-sm-4 col-12 col-form-label text-left">
                    { t('Current Logo') }
                  </label>
                  <div className="col-sm-8 col-12">
                    {uploadedLogoSrc && (<p><img src={uploadedLogoSrc} className="picture picture-lg " id="settingBrandLogo" width="64" /></p>)}
                    {isUploadedLogo && <button type="button" className="btn btn-danger" onClick={this.onClickDeleteBtn}>{ t('Delete Logo') }</button>}
                  </div>
                </div>
                <div className="row">
                  <label className="col-sm-4 col-12 col-form-label text-left">
                    {t('Upload new logo')}
                  </label>
                  <div className="col-sm-8 col-12">
                    <input type="file" onChange={this.onSelectFile} name="brandLogo" accept="image/*" />
                  </div>
                </div>
              </div>
            </div>
            <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
          </div>
        </div>

        <CropLogoModal
          show={this.state.show}
          src={this.state.src}
          onModalClose={this.cancelModal}
          onCropCompleted={this.onCropCompleted}
        />
      </React.Fragment>
    );
  }

}

const CustomizeLogoSettingWrapper = withUnstatedContainers(CustomizeLogoSetting, [AppContainer, AdminCustomizeContainer]);

CustomizeLogoSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeLogoSettingWrapper);
