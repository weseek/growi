import React, { FC, useState } from 'react';

import { useTranslation } from 'react-i18next';


import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import AppContainer from '~/client/services/AppContainer';
import {
  toastError, toastSuccess,
} from '~/client/util/apiNotification';
import ImageCropModal from '~/components/Common/ImageCropModal';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';


type Props = {
  adminCustomizeContainer : AdminCustomizeContainer
}

const CustomizeLogoSetting: FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const { adminCustomizeContainer } = props;
  const [isShow, setIsShow] = useState<boolean>(false);
  const [src, setSrc] = useState<ArrayBuffer | string | null>(null);
  const {
    customizedLogoSrc, isDefaultLogo, defaultLogoSrc,
  } = adminCustomizeContainer.state;

  const hideModal = () => {
    setIsShow(false);
  };

  const cancelModal = () => {
    hideModal();
  };

  const showModal = () => {
    setIsShow(true);
  };

  const onSelectFile = (e) => {
    if (e.target.files != null && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
      showModal();
    }
  };

  const onClickSubmit = async() => {
    try {
      await adminCustomizeContainer.updateCustomizeLogo();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.custom_logo') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  const onClickDeleteBtn = async() => {
    try {
      await adminCustomizeContainer.deleteLogo();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.current_logo') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  const onCropCompleted = async(croppedImage) => {
    try {
      await adminCustomizeContainer.uploadBrandLogo(croppedImage);
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.current_logo') }));
    }
    catch (err) {
      toastError(err);
    }
    hideModal();
  };


  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <div className="mb-5">
            <h2 className="border-bottom my-4 admin-setting-header">{t('admin:customize_setting.custom_logo')}</h2>
            <div className="row">
              <div className="col-md-6 col-12 mb-3 mb-md-0">
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
                      {t('admin:customize_setting.default_logo')}
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
                      { t('admin:customize_setting.upload_logo') }
                    </label>
                  </div>
                </h4>
                <div className="row mb-3">
                  <label className="col-sm-4 col-12 col-form-label text-left">
                    { t('admin:customize_setting.current_logo') }
                  </label>
                  <div className="col-sm-8 col-12">
                    <p><img src={customizedLogoSrc || defaultLogoSrc} className="picture picture-lg " id="settingBrandLogo" width="64" /></p>
                    {(customizedLogoSrc != null) && (
                      <button type="button" className="btn btn-danger" onClick={onClickDeleteBtn}>
                        { t('admin:customize_setting.delete_logo') }
                      </button>
                    )}
                  </div>
                </div>
                <div className="row">
                  <label className="col-sm-4 col-12 col-form-label text-left">
                    { t('admin:customize_setting.upload_new_logo') }
                  </label>
                  <div className="col-sm-8 col-12">
                    <input type="file" onChange={onSelectFile} name="brandLogo" accept="image/*" />
                  </div>
                </div>
              </div>
            </div>
            <AdminUpdateButtonRow onClick={onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
          </div>
        </div>
      </div>

      <ImageCropModal
        isShow={isShow}
        src={src}
        onModalClose={cancelModal}
        onCropCompleted={onCropCompleted}
        isCircular={false}
      />
    </React.Fragment>
  );


};

const CustomizeLogoSettingWrapper = withUnstatedContainers(CustomizeLogoSetting, [AppContainer, AdminCustomizeContainer]);

export default CustomizeLogoSettingWrapper;
