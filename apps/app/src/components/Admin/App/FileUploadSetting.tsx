import React, { ChangeEvent, useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import { AwsSettingMolecule } from './AwsSetting';
import type { AwsSettingMoleculeProps } from './AwsSetting';
import { GcsSettingMolecule } from './GcsSetting';
import type { GcsSettingMoleculeProps } from './GcsSetting';

const fileUploadTypes = ['aws', 'gcs', 'gridfs', 'local'] as const;

type FileUploadSettingMoleculeProps = {
  fileUploadType: string
  isFixedFileUploadByEnvVar: boolean
  envFileUploadType?: string
  onChangeFileUploadType: (e: ChangeEvent, type: string) => void
} & AwsSettingMoleculeProps & GcsSettingMoleculeProps;

export const FileUploadSettingMolecule = React.memo((props: FileUploadSettingMoleculeProps): JSX.Element => {
  const { t } = useTranslation(['admin', 'commons']);

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
              <div key={type} className="form-check custom-radio form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  name="file-upload-type"
                  id={`file-upload-type-radio-${type}`}
                  checked={props.fileUploadType === type}
                  disabled={props.isFixedFileUploadByEnvVar}
                  onChange={(e) => { props?.onChangeFileUploadType(e, type) }}
                />
                <label className="form-check-label" htmlFor={`file-upload-type-radio-${type}`}>{t(`admin:app_setting.${type}_label`)}</label>
              </div>
            );
          })}
        </div>
        {props.isFixedFileUploadByEnvVar && (
          <p className="alert alert-warning mt-2 text-left offset-3 col-6">
            <i className="icon-exclamation icon-fw">
            </i><b>FIXED</b><br />
            {/* eslint-disable-next-line react/no-danger */}
            <b dangerouslySetInnerHTML={{ __html: t('admin:app_setting.fixed_by_env_var', { fileUploadType: props.envFileUploadType }) }} />
          </p>
        )}
      </div>

      {props.fileUploadType === 'aws' && (
        <AwsSettingMolecule
          s3ReferenceFileWithRelayMode={props.s3ReferenceFileWithRelayMode}
          s3Region={props.s3Region}
          s3CustomEndpoint={props.s3CustomEndpoint}
          s3Bucket={props.s3Bucket}
          s3AccessKeyId={props.s3AccessKeyId}
          s3SecretAccessKey={props.s3SecretAccessKey}
          onChangeS3ReferenceFileWithRelayMode={props.onChangeS3ReferenceFileWithRelayMode}
          onChangeS3Region={props.onChangeS3Region}
          onChangeS3CustomEndpoint={props.onChangeS3CustomEndpoint}
          onChangeS3Bucket={props.onChangeS3Bucket}
          onChangeS3AccessKeyId={props.onChangeS3AccessKeyId}
          onChangeS3SecretAccessKey={props.onChangeS3SecretAccessKey}
        />
      )}
      {props.fileUploadType === 'gcs' && (
        <GcsSettingMolecule
          gcsReferenceFileWithRelayMode={props.gcsReferenceFileWithRelayMode}
          gcsUseOnlyEnvVars={props.gcsUseOnlyEnvVars}
          gcsApiKeyJsonPath={props.gcsApiKeyJsonPath}
          gcsBucket={props.gcsBucket}
          gcsUploadNamespace={props.gcsUploadNamespace}
          envGcsApiKeyJsonPath={props.envGcsApiKeyJsonPath}
          envGcsBucket={props.envGcsBucket}
          envGcsUploadNamespace={props.envGcsUploadNamespace}
          onChangeGcsReferenceFileWithRelayMode={props.onChangeGcsReferenceFileWithRelayMode}
          onChangeGcsApiKeyJsonPath={props.onChangeGcsApiKeyJsonPath}
          onChangeGcsBucket={props.onChangeGcsBucket}
          onChangeGcsUploadNamespace={props.onChangeGcsUploadNamespace}
        />
      )}
    </>
  );
});
FileUploadSettingMolecule.displayName = 'FileUploadSettingMolecule';


type FileUploadSettingProps = {
  adminAppContainer: AdminAppContainer
}

const FileUploadSetting = (props: FileUploadSettingProps): JSX.Element => {
  const { t } = useTranslation(['admin', 'commons']);
  const { adminAppContainer } = props;

  const {
    fileUploadType, isFixedFileUploadByEnvVar, envFileUploadType, retrieveError,
    s3ReferenceFileWithRelayMode,
    s3Region, s3CustomEndpoint, s3Bucket,
    s3AccessKeyId, s3SecretAccessKey,
    gcsReferenceFileWithRelayMode, gcsUseOnlyEnvVars,
    gcsApiKeyJsonPath, envGcsApiKeyJsonPath, gcsBucket,
    envGcsBucket, gcsUploadNamespace, envGcsUploadNamespace,
  } = adminAppContainer.state;

  const submitHandler = useCallback(async() => {
    try {
      await adminAppContainer.updateFileUploadSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.file_upload_settings'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminAppContainer, t]);

  const onChangeFileUploadTypeHandler = useCallback((e: ChangeEvent, type: string) => {
    adminAppContainer.changeFileUploadType(type);
  }, [adminAppContainer]);

  // S3
  const onChangeS3ReferenceFileWithRelayModeHandler = useCallback((val: boolean) => {
    adminAppContainer.changeS3ReferenceFileWithRelayMode(val);
  }, [adminAppContainer]);

  const onChangeS3RegionHandler = useCallback((val: string) => {
    adminAppContainer.changeS3Region(val);
  }, [adminAppContainer]);

  const onChangeS3CustomEndpointHandler = useCallback((val: string) => {
    adminAppContainer.changeS3CustomEndpoint(val);
  }, [adminAppContainer]);

  const onChangeS3BucketHandler = useCallback((val: string) => {
    adminAppContainer.changeS3Bucket(val);
  }, [adminAppContainer]);

  const onChangeS3AccessKeyIdHandler = useCallback((val: string) => {
    adminAppContainer.changeS3AccessKeyId(val);
  }, [adminAppContainer]);

  const onChangeS3SecretAccessKeyHandler = useCallback((val: string) => {
    adminAppContainer.changeS3SecretAccessKey(val);
  }, [adminAppContainer]);

  // GCS
  const onChangeGcsReferenceFileWithRelayModeHandler = useCallback((val: boolean) => {
    adminAppContainer.changeGcsReferenceFileWithRelayMode(val);
  }, [adminAppContainer]);

  const onChangeGcsApiKeyJsonPathHandler = useCallback((val: string) => {
    adminAppContainer.changeGcsApiKeyJsonPath(val);
  }, [adminAppContainer]);

  const onChangeGcsBucketHandler = useCallback((val: string) => {
    adminAppContainer.changeGcsBucket(val);
  }, [adminAppContainer]);

  const onChangeGcsUploadNamespaceHandler = useCallback((val: string) => {
    adminAppContainer.changeGcsUploadNamespace(val);
  }, [adminAppContainer]);

  return (
    <>
      <FileUploadSettingMolecule
        fileUploadType={fileUploadType}
        isFixedFileUploadByEnvVar={isFixedFileUploadByEnvVar}
        envFileUploadType={envFileUploadType}
        onChangeFileUploadType={onChangeFileUploadTypeHandler}
        s3ReferenceFileWithRelayMode={s3ReferenceFileWithRelayMode}
        s3Region={s3Region}
        s3CustomEndpoint={s3CustomEndpoint}
        s3Bucket={s3Bucket}
        s3AccessKeyId={s3AccessKeyId}
        s3SecretAccessKey={s3SecretAccessKey}
        onChangeS3ReferenceFileWithRelayMode={onChangeS3ReferenceFileWithRelayModeHandler}
        onChangeS3Region={onChangeS3RegionHandler}
        onChangeS3CustomEndpoint={onChangeS3CustomEndpointHandler}
        onChangeS3Bucket={onChangeS3BucketHandler}
        onChangeS3AccessKeyId={onChangeS3AccessKeyIdHandler}
        onChangeS3SecretAccessKey={onChangeS3SecretAccessKeyHandler}
        gcsReferenceFileWithRelayMode={gcsReferenceFileWithRelayMode}
        gcsUseOnlyEnvVars={gcsUseOnlyEnvVars}
        gcsApiKeyJsonPath={gcsApiKeyJsonPath}
        gcsBucket={gcsBucket}
        gcsUploadNamespace={gcsUploadNamespace}
        envGcsApiKeyJsonPath={envGcsApiKeyJsonPath}
        envGcsBucket={envGcsBucket}
        envGcsUploadNamespace={envGcsUploadNamespace}
        onChangeGcsReferenceFileWithRelayMode={onChangeGcsReferenceFileWithRelayModeHandler}
        onChangeGcsApiKeyJsonPath={onChangeGcsApiKeyJsonPathHandler}
        onChangeGcsBucket={onChangeGcsBucketHandler}
        onChangeGcsUploadNamespace={onChangeGcsUploadNamespaceHandler}
      />
      <AdminUpdateButtonRow onClick={submitHandler} disabled={retrieveError != null} />
    </>
  );
};


/**
 * Wrapper component for using unstated
 */
const FileUploadSettingWrapper = withUnstatedContainers(FileUploadSetting, [AdminAppContainer]);

export default FileUploadSettingWrapper;
