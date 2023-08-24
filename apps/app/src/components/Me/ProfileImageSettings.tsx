import React, { useCallback, useState } from 'react';


import { useTranslation } from 'next-i18next';

import { apiPost, apiPostForm } from '~/client/util/apiv1-client';
import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import ImageCropModal from '~/components/Common/ImageCropModal';
import { useCurrentUser } from '~/stores/context';
import { generateGravatarSrc, GRAVATAR_DEFAULT } from '~/utils/gravatar';


const DEFAULT_IMAGE = '/images/icons/user.svg';


const ProfileImageSettings = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: currentUser } = useCurrentUser();

  const [isGravatarEnabled, setGravatarEnabled] = useState(currentUser?.isGravatarEnabled);
  const [uploadedPictureSrc, setUploadedPictureSrc] = useState(() => {
    if (typeof currentUser?.imageAttachment === 'string') {
      return currentUser?.image;
    }
    return currentUser?.imageAttachment?.filePathProxied ?? currentUser?.image;
  });

  const [showImageCropModal, setShowImageCropModal] = useState(false);
  const [imageCropSrc, setImageCropSrc] = useState<string|ArrayBuffer|null>(null);

  const selectFileHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null || e.target.files.length === 0) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => setImageCropSrc(reader.result));
    reader.readAsDataURL(e.target.files[0]);

    setShowImageCropModal(true);
  }, []);

  const processImageCompletedHandler = useCallback(async(croppedImage) => {
    try {
      const formData = new FormData();
      formData.append('file', croppedImage);
      const response = await apiPostForm('/attachments.uploadProfileImage', formData);

      toastSuccess(t('toaster.update_successed', { target: t('Current Image'), ns: 'commons' }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUploadedPictureSrc((response as any).attachment.filePathProxied);

    }
    catch (err) {
      toastError(err);
    }
  }, [t]);

  const deleteImageHandler = useCallback(async() => {
    try {
      await apiPost('/attachments.removeProfileImage');

      setUploadedPictureSrc(undefined);
      toastSuccess(t('toaster.update_successed', { target: t('Current Image'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t]);

  const submit = useCallback(async() => {
    try {
      const response = await apiv3Put('/personal-setting/image-type', { isGravatarEnabled });

      const { userData } = response.data;
      setGravatarEnabled(userData.isGravatarEnabled);

      toastSuccess(t('toaster.update_successed', { target: t('Set Profile Image'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [isGravatarEnabled, t]);

  if (currentUser == null) {
    return <></>;
  }

  return (
    <>
      <div className="row">
        <div className="col-md-6 col-12 mb-3 mb-md-0">
          <h4>
            <div className="custom-control custom-radio radio-primary">
              <input
                type="radio"
                id="radioGravatar"
                className="custom-control-input"
                form="formImageType"
                name="imagetypeForm[isGravatarEnabled]"
                checked={isGravatarEnabled}
                onChange={() => setGravatarEnabled(true)}
              />
              <label className="custom-control-label" htmlFor="radioGravatar">
                <img src={GRAVATAR_DEFAULT} data-vrt-blackout-profile /> Gravatar
              </label>
              <a href="https://gravatar.com/">
                <small><i className="icon-arrow-right-circle" aria-hidden="true"></i></small>
              </a>
            </div>
          </h4>
          <img src={generateGravatarSrc(currentUser.email)} width="64" data-vrt-blackout-profile />
        </div>

        <div className="col-md-6 col-12">
          <h4>
            <div className="custom-control custom-radio radio-primary">
              <input
                type="radio"
                id="radioUploadPicture"
                className="custom-control-input"
                form="formImageType"
                name="imagetypeForm[isGravatarEnabled]"
                checked={!isGravatarEnabled}
                onChange={() => setGravatarEnabled(false)}
              />
              <label className="custom-control-label" htmlFor="radioUploadPicture">
                { t('Upload Image') }
              </label>
            </div>
          </h4>
          <div className="row mb-3">
            <label className="col-sm-4 col-12 col-form-label text-start">
              { t('Current Image') }
            </label>
            <div className="col-sm-8 col-12">
              <p><img src={uploadedPictureSrc ?? DEFAULT_IMAGE} className="picture picture-lg rounded-circle" id="settingUserPicture" /></p>
              {uploadedPictureSrc && <button type="button" className="btn btn-danger" onClick={deleteImageHandler}>{ t('Delete Image') }</button>}
            </div>
          </div>
          <div className="row">
            <label className="col-sm-4 col-12 col-form-label text-start">
              {t('Upload new image')}
            </label>
            <div className="col-sm-8 col-12">
              <input type="file" onChange={selectFileHandler} name="profileImage" accept="image/*" />
            </div>
          </div>
        </div>
      </div>

      <ImageCropModal
        isShow={showImageCropModal}
        src={imageCropSrc}
        onModalClose={() => setShowImageCropModal(false)}
        onImageProcessCompleted={processImageCompletedHandler}
        isCircular
        showCropOption
      />

      <div className="row my-3">
        <div className="offset-4 col-5">
          <button type="button" className="btn btn-primary" onClick={submit}>
            {t('Update')}
          </button>
        </div>
      </div>

    </>
  );

};

export default ProfileImageSettings;
