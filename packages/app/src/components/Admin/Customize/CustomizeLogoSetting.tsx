import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import {
  apiv3Delete, apiv3Get, apiv3PostForm, apiv3Put,
} from '~/client/util/apiv3-client';
import ImageCropModal from '~/components/Common/ImageCropModal';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const DEFAULT_LOGO = '/images/logo.svg';

const CustomizeLogoSetting = (): JSX.Element => {

  const { t } = useTranslation();

  const [uploadLogoSrc, setUploadLogoSrc] = useState<ArrayBuffer | string | null>(null);
  const [isImageCropModalShow, setIsImageCropModalShow] = useState<boolean>(false);
  const [isDefaultLogo, setIsDefaultLogo] = useState<boolean>(true);
  const [retrieveError, setRetrieveError] = useState<any>();
  const [customizedLogoSrc, setCustomizedLogoSrc] = useState< string | null >(null);

  const retrieveData = useCallback(async() => {
    try {
      const response = await apiv3Get('/customize-setting/customize-logo');
      const { isDefaultLogo: _isDefaultLogo, customizedLogoSrc } = response.data;
      const isDefaultLogo = _isDefaultLogo ?? true;

      setIsDefaultLogo(isDefaultLogo);
      setCustomizedLogoSrc(customizedLogoSrc);
    }
    catch (err) {
      setRetrieveError(err);
      throw new Error('Failed to fetch data');
    }
  }, []);

  useEffect(() => {
    retrieveData();
  }, [retrieveData]);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files != null && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setUploadLogoSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
      setIsImageCropModalShow(true);
    }
  }, []);

  const onClickSubmit = useCallback(async() => {
    try {
      const response = await apiv3Put('/customize-setting/customize-logo', {
        isDefaultLogo,
        customizedLogoSrc,
      });
      const { customizedParams } = response.data;
      setIsDefaultLogo(customizedParams.isDefaultLogo);
      setCustomizedLogoSrc(customizedParams.customizedLogoSrc);
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_settings.custom_logo'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, isDefaultLogo, customizedLogoSrc]);

  const onClickDeleteBtn = useCallback(async() => {
    try {
      await apiv3Delete('/customize-setting/delete-brand-logo');
      setCustomizedLogoSrc(null);
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_settings.current_logo'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
      setRetrieveError(err);
      throw new Error('Failed to delete logo');
    }
  }, [t]);


  const processImageCompletedHandler = useCallback(async(croppedImage) => {
    try {
      const formData = new FormData();
      formData.append('file', croppedImage);
      const { data } = await apiv3PostForm('/customize-setting/upload-brand-logo', formData);
      setCustomizedLogoSrc(data.attachment.filePathProxied);
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_settings.current_logo'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
      setRetrieveError(err);
      throw new Error('Failed to upload brand logo');
    }
  }, [t]);

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <div className="mb-5">
            <h2 className="border-bottom my-4 admin-setting-header">{t('admin:customize_settings.custom_logo')}</h2>
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
                      onChange={() => { setIsDefaultLogo(true) }}
                    />
                    <label className="custom-control-label" htmlFor="radioDefaultLogo">
                      {t('admin:customize_settings.default_logo')}
                    </label>
                  </div>
                </h4>
                <img src={DEFAULT_LOGO} width="64" />
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
                      onChange={() => { setIsDefaultLogo(false) }}
                    />
                    <label className="custom-control-label" htmlFor="radioUploadLogo">
                      { t('admin:customize_settings.upload_logo') }
                    </label>
                  </div>
                </h4>
                <div className="row mb-3">
                  <label className="col-sm-4 col-12 col-form-label text-left">
                    { t('admin:customize_settings.current_logo') }
                  </label>
                  <div className="col-sm-8 col-12">
                    <p><img src={customizedLogoSrc || DEFAULT_LOGO} className="picture picture-lg " id="settingBrandLogo" width="64" /></p>
                    {(customizedLogoSrc != null) && (
                      <button type="button" className="btn btn-danger" onClick={onClickDeleteBtn}>
                        { t('admin:customize_settings.delete_logo') }
                      </button>
                    )}
                  </div>
                </div>
                <div className="row">
                  <label className="col-sm-4 col-12 col-form-label text-left">
                    { t('admin:customize_settings.upload_new_logo') }
                  </label>
                  <div className="col-sm-8 col-12">
                    <input type="file" onChange={onSelectFile} name="brandLogo" accept="image/*" />
                  </div>
                </div>
              </div>
            </div>
            <AdminUpdateButtonRow onClick={onClickSubmit} disabled={retrieveError != null} />
          </div>
        </div>
      </div>

      <ImageCropModal
        isShow={isImageCropModalShow}
        src={uploadLogoSrc}
        onModalClose={() => setIsImageCropModalShow(false)}
        onImageProcessCompleted={processImageCompletedHandler}
        isCircular={false}
        showCropOption={false}
      />
    </React.Fragment>
  );


};


export default CustomizeLogoSetting;
