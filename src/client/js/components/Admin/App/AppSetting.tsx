import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { i18n, useTranslation, config } from '~/i18n';


import loggerFactory from '~/utils/logger';
import { useAppSettingsSWR } from '~/stores/admin';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { apiv3Put } from '~/utils/apiv3-client';

const logger = loggerFactory('growi:appSettings');

type FormValues = {
  title: string,
  confidential: string,
  globalLang: string,
  fileUpload: string,
}

const AppSetting = ():JSX.Element => {
  const { t } = useTranslation();
  const { data, mutate } = useAppSettingsSWR();

  const appSettingMethods = useForm({
    defaultValues: {
      title: data?.title,
      confidential: data?.confidential,
      globalLang: data?.globalLang,
      fileUpload: data?.fileUpload,
    },
  });

  const submitHandler: SubmitHandler<FormValues> = async(formValues) => {
    try {
      await apiv3Put('/app-settings/app-setting', formValues);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data?.title,
    data?.confidential,
    data?.globalLang,
    data?.fileUpload,
  ]);

  return (
    <form role="form" onSubmit={appSettingMethods.handleSubmit(submitHandler)}>
      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:app_setting.site_name')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            name="title"
            type="text"
            placeholder="GROWI"
            ref={appSettingMethods.register}
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
            name="confidential"
            type="text"
            placeholder={t('admin:app_setting.confidential_example')}
            ref={appSettingMethods.register}
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
          {config.allLanguages.map((lang) => {
            const fixedT = i18n.getFixedT(lang);
            return (
              <div key={lang} className="custom-control custom-radio custom-control-inline">
                <input
                  type="radio"
                  id={`radioLang${lang}`}
                  className="custom-control-input"
                  name="globalLang"
                  value={lang}
                  ref={appSettingMethods.register}
                />
                <label className="custom-control-label" htmlFor={`radioLang${lang}`}>{fixedT('meta.display_name')}</label>
              </div>
            );
          })}
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
              ref={appSettingMethods.register}
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
