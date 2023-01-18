import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import AdminAppContainer from '~/client/services/AdminAppContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

type AwsSettingMoleculeProps = {
  s3ReferenceFileWithRelayMode
  s3Region
  s3CustomEndpoint
  s3Bucket
  s3AccessKeyId
  s3SecretAccessKey
  onChangeS3ReferenceFileWithRelayMode: (val: boolean) => void
  onChangeS3Region: (val: string) => void
  onChangeS3CustomEndpoint: (val: string) => void
  onChangeS3Bucket: (val: string) => void
  onChangeS3AccessKeyId: (val: string) => void
  onChangeS3SecretAccessKey: (val: string) => void
};

export const AwsSettingMolecule = (props: AwsSettingMoleculeProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <React.Fragment>

      <div className="row form-group my-3">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.file_delivery_method')}
        </label>

        <div className="col-md-6">
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="ddS3ReferenceFileWithRelayMode"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="true"
            >
              {props.s3ReferenceFileWithRelayMode && t('admin:app_setting.file_delivery_method_relay')}
              {!props.s3ReferenceFileWithRelayMode && t('admin:app_setting.file_delivery_method_redirect')}
            </button>
            <div className="dropdown-menu" aria-labelledby="ddS3ReferenceFileWithRelayMode">
              <button
                className="dropdown-item"
                type="button"
                onClick={() => { props?.onChangeS3ReferenceFileWithRelayMode(true) }}
              >
                {t('admin:app_setting.file_delivery_method_relay')}
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => { props?.onChangeS3ReferenceFileWithRelayMode(false) }}
              >
                { t('admin:app_setting.file_delivery_method_redirect')}
              </button>
            </div>

            <p className="form-text text-muted small">
              {t('admin:app_setting.file_delivery_method_redirect_info')}
              <br />
              {t('admin:app_setting.file_delivery_method_relay_info')}
            </p>
          </div>
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.region')}
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder={`${t('eg')} ap-northeast-1`}
            defaultValue={props.s3Region || ''}
            onChange={(e) => {
              props?.onChangeS3Region(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.custom_endpoint')}
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            placeholder={`${t('eg')} http://localhost:9000`}
            defaultValue={props.s3CustomEndpoint || ''}
            onChange={(e) => {
              props?.onChangeS3CustomEndpoint(e.target.value);
            }}
          />
          <p className="form-text text-muted">{t('admin:app_setting.custom_endpoint_change')}</p>
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.bucket_name')}
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            placeholder={`${t('eg')} crowi`}
            defaultValue={props.s3Bucket || ''}
            onChange={(e) => {
              props.onChangeS3Bucket(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          Access key ID
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            defaultValue={props.s3AccessKeyId || ''}
            onChange={(e) => {
              props?.onChangeS3AccessKeyId(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          Secret access key
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            defaultValue={props.s3SecretAccessKey || ''}
            onChange={(e) => {
              props?.onChangeS3SecretAccessKey(e.target.value);
            }}
          />
        </div>
      </div>


    </React.Fragment>
  );
};


const AwsSetting = (props) => {
  const { adminAppContainer } = props;
  const {
    s3ReferenceFileWithRelayMode,
    s3Region, s3CustomEndpoint, s3Bucket,
    s3AccessKeyId, s3SecretAccessKey,
  } = adminAppContainer.state;

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

  return <AwsSettingMolecule
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
  />;
};


/**
 * Wrapper component for using unstated
 */
const AwsSettingWrapper = withUnstatedContainers(AwsSetting, [AdminAppContainer]);

export default AwsSettingWrapper;
