import React, { FC, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { i18n, useTranslation, config } from '~/i18n';


import loggerFactory from '~/utils/logger';
import { useAppSettingsSWR } from '~/stores/admin';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { apiv3Put } from '~/utils/apiv3-client';

const logger = loggerFactory('growi:appSettings');

const titleInputName = 'title';
const confidentialInputName = 'confidential';
const globalLangInputName = 'globalLang';
const fileUploadInputName = 'fileUpload';

type FormValues = {
  [titleInputName]: string,
  [confidentialInputName]: string,
  [globalLangInputName]: string,
  [fileUploadInputName]: string,
}

export const AppSetting:FC = () => {
  const { t } = useTranslation();
  const { data, mutate } = useAppSettingsSWR();

  const { register, setValue, handleSubmit } = useForm({
    defaultValues: {
      [titleInputName]: data?.[titleInputName],
      [confidentialInputName]: data?.[confidentialInputName],
      [globalLangInputName]: data?.[globalLangInputName],
      [fileUploadInputName]: data?.[fileUploadInputName],
    },
  });

  const submitHandler: SubmitHandler<FormValues> = async(formValues:FormValues) => {
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
    setValue(titleInputName, data?.[titleInputName]);
    setValue(confidentialInputName, data?.[confidentialInputName]);
    setValue(globalLangInputName, data?.[globalLangInputName]);
    setValue(fileUploadInputName, data?.[fileUploadInputName]);
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [
    data?.[titleInputName],
    data?.[confidentialInputName],
    data?.[globalLangInputName],
    data?.[fileUploadInputName],
  ]);

  const renderRadioButtonsForDefaultLanguage = () => {
    const elements: JSX.Element[] = config.allLanguages.map((lang) => {
      const fixedT = i18n.getFixedT(lang);
      i18n.loadLanguages(config.allLanguages);
      return (
        <div key={lang} className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id={`radioLang${lang}`}
            className="custom-control-input"
            name={globalLangInputName}
            value={lang}
            ref={register}
          />
          <label className="custom-control-label" htmlFor={`radioLang${lang}`}>{fixedT('meta.display_name')}</label>
        </div>
      );
    });

    return <>{elements}</>;
  };


  return (
    <form role="form" onSubmit={handleSubmit(submitHandler)}>
      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:app_setting.site_name')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            name={titleInputName}
            type="text"
            placeholder="GROWI"
            ref={register}
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
            name={confidentialInputName}
            type="text"
            placeholder={t('admin:app_setting.confidential_example')}
            ref={register}
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
          { renderRadioButtonsForDefaultLanguage() }
        </div>
      </div>

      {/*
        * https://youtrack.weseek.co.jp/issue/GW-5701

      <div className="row form-group mb-5">
        <label
          className="text-left text-md-right col-md-3 col-form-label"
        >
          {t('admin:app_setting.default_mail_visibility')}
        </label>
        <div className="col-md-6 py-2">

          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              id="radio-email-show"
              className="custom-control-input"
              name="mailVisibility"
              checked={adminAppContainer.state.isEmailPublishedForNewUser === true}
              onChange={() => { adminAppContainer.changeIsEmailPublishedForNewUserShow(true) }}
            />
            <label className="custom-control-label" htmlFor="radio-email-show">{t('Show')}</label>
          </div>

          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              id="radio-email-hide"
              className="custom-control-input"
              name="mailVisibility"
              checked={adminAppContainer.state.isEmailPublishedForNewUser === false}
              onChange={() => { adminAppContainer.changeIsEmailPublishedForNewUserShow(false) }}
            />
            <label className="custom-control-label" htmlFor="radio-email-hide">{t('Hide')}</label>
          </div>

        </div>
      </div>
      */}

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
              name={fileUploadInputName}
              ref={register}
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
        <button type="submit" className="btn btn-primary">{ t('Update') }</button>
      </div>
    </form>
  );

};
