import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from '~/i18n';


import loggerFactory from '~/utils/logger';
import { useAppSettingsSWR } from '~/stores/admin';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { apiv3Put } from '~/utils/apiv3-client';

const logger = loggerFactory('growi:appSettings');

const AppSetting = ():JSX.Element => {
  const { t } = useTranslation();
  const { data, mutate } = useAppSettingsSWR();

  const appSettingMethods = useForm({
    defaultValues: {
      title: data?.title,
      confidential: data?.confidential,
      globalLang: data?.globalLang,
      fileUpload: data?.fileUpload,
      siteUrl: data?.envSiteUrl,
      envSiteUrl: data?.envSiteUrl,
      isMailerSetup: data?.isMailerSetup,
      fromAddress: data?.fromAddress,
    },
  });

  const submitHandler: SubmitHandler<FormValues> = async(formValues) => {
    try {
      await apiv3Put('/app-setting/app', formValues);
      mutate();
      toastSuccess(t('toaster.update_successed', { target: t('App Settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  useEffect(() => {
    appSettingMethods.setValue('title', data?.title);
    appSettingMethods.setValue('confidential', data?.confidential);
    appSettingMethods.setValue('globalLang', data?.globalLang);
    appSettingMethods.setValue('fileUpload', data?.fileUpload);
    appSettingMethods.setValue('siteUrl', data?.siteUrl);
    appSettingMethods.setValue('isMailerSetup', data?.isMailerSetup);
    appSettingMethods.setValue('fromAddress', data?.fromAddress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.themeType]);

  return (
    <form role="form" onSubmit={appSettingMethods.handleSubmit(submitHandler)}>
      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:app_setting.site_name')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            defaultValue={adminAppContainer.state.title || ''}
            onChange={(e) => {
                adminAppContainer.changeTitle(e.target.value);
              }}
            placeholder="GROWI"
          />
          <p className="form-text text-muted">{t('admin:app_setting.sitename_change')}</p>
        </div>
      </div>

      <div className="row form-group mb-5">
        <label
          className="text-left text-md-right col-md-3 col-form-label"
        >
          {t('admin:app_setting.confidential_name')}
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            defaultValue={adminAppContainer.state.confidential || ''}
            onChange={(e) => {
                adminAppContainer.changeConfidential(e.target.value);
              }}
            placeholder={t('admin:app_setting.confidential_example')}
          />
          <p className="form-text text-muted">{t('admin:app_setting.header_content')}</p>
        </div>
      </div>

      <div className="row form-group mb-5">
        <label
          className="text-left text-md-right col-md-3 col-form-label"
        >
          {t('admin:app_setting.default_language')}
        </label>
        <div className="col-md-6 py-2">
          {
              nextI18NextConfig.allLanguages.map(lang => (
                <div key={lang} className="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    id={`radioLang${lang}`}
                    className="custom-control-input"
                    name="globalLang"
                    value={lang}
                    checked={adminAppContainer.state.globalLang === lang}
                    onChange={(e) => {
                      adminAppContainer.changeGlobalLang(e.target.value);
                    }}
                  />
                  <label className="custom-control-label" htmlFor={`radioLang${lang}`}>{t('meta.display_name')}</label>
                </div>
              ))
            }
        </div>
      </div>

      <div className="row form-group mb-5">
        <label
          className="text-left text-md-right col-md-3 col-form-label"
        >
          {t('admin:app_setting.file_uploading')}
        </label>
        <div className="col-md-6">
          <div className="custom-control custom-checkbox custom-checkbox-info">
            <input
              type="checkbox"
              id="cbFileUpload"
              className="custom-control-input"
              name="fileUpload"
              checked={adminAppContainer.state.fileUpload != null}
              onChange={(e) => {
                  adminAppContainer.changeFileUpload(e.target.checked);
                }}
            />
            <label
              className="custom-control-label"
              htmlFor="cbFileUpload"
            >
              {t('admin:app_setting.enable_files_except_image')}
            </label>
          </div>

          <p className="form-text text-muted">
            {t('admin:app_setting.attach_enable')}
          </p>
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <input type="submit" value={t('Update')} className="btn btn-primary" />
      </div>
    </form>
  );

};

export default AppSetting;
