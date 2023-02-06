import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import AwsSetting from './AwsSetting';
import GcsSettings from './GcsSettings';


type Props = {
  adminAppContainer: AdminAppContainer,
}


const FileUploadSetting = (props: Props) => {
  const { t } = useTranslation(['admin', 'commons']);
  const { adminAppContainer } = props;
  const { fileUploadType } = adminAppContainer.state;
  const fileUploadTypes = ['aws', 'gcs', 'gridfs', 'local'];

  const submitHandler = useCallback(async() => {
    try {
      await adminAppContainer.updateFileUploadSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.file_upload_settings'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminAppContainer, t]);

  return (
    <>
      <p className="card well my-3">
        {t('admin:app_setting.file_upload')}
        <br />
        <br />
        <span className="text-danger">
          <i className="ti ti-unlink"></i>
          {t('admin:app_setting.change_setting')}
        </span>
      </p>

      <div className="row form-group mb-3">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.file_upload_method')}
        </label>

        <div className="col-md-6 py-2">
          {fileUploadTypes.map((type) => {
            return (
              <div key={type} className="custom-control custom-radio custom-control-inline">
                <input
                  type="radio"
                  className="custom-control-input"
                  name="file-upload-type"
                  id={`file-upload-type-radio-${type}`}
                  checked={adminAppContainer.state.fileUploadType === type}
                  disabled={adminAppContainer.state.isFixedFileUploadByEnvVar}
                  onChange={() => { adminAppContainer.changeFileUploadType(type) }}
                />
                <label className="custom-control-label" htmlFor={`file-upload-type-radio-${type}`}>{t(`admin:app_setting.${type}_label`)}</label>
              </div>
            );
          })}
        </div>
        {adminAppContainer.state.isFixedFileUploadByEnvVar && (
          <p className="alert alert-warning mt-2 text-left offset-3 col-6">
            <i className="icon-exclamation icon-fw">
            </i><b>FIXED</b><br />
            {/* eslint-disable-next-line react/no-danger */}
            <b dangerouslySetInnerHTML={{ __html: t('admin:app_setting.fixed_by_env_var', { fileUploadType: adminAppContainer.state.envFileUploadType }) }} />
          </p>
        )}
      </div>

      {fileUploadType === 'aws' && <AwsSetting />}
      {fileUploadType === 'gcs' && <GcsSettings />}

      <AdminUpdateButtonRow onClick={submitHandler} disabled={adminAppContainer.state.retrieveError != null} />
    </>
  );
};


/**
 * Wrapper component for using unstated
 */
const FileUploadSettingWrapper = withUnstatedContainers(FileUploadSetting, [AdminAppContainer]);

export default FileUploadSettingWrapper;
