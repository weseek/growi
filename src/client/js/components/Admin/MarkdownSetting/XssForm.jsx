import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import loggerFactory from '@alias/logger';
import { useTranslation } from '~/i18n';

import { tags, attrs } from '~/service/xss/recommended-whitelist';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { useMarkdownSettingsSWR } from '~/stores/admin';

import WhiteListInput from './WhiteListInput';
import { apiv3Put } from '../../../util/apiv3-client';

const logger = loggerFactory('growi:importer');

const XssForm = (props) => {
  const { t } = useTranslation();
  const { data, mutate } = useMarkdownSettingsSWR();

  const xssFormMethods = useForm({
    defaultValues: {
      isEnabledXss: data?.isEnabledXss,
      // Cast to a string value because radio not work with int value with react-hook-form
      xssOption: String(data?.xssOption),
      tagWhiteList: data?.tagWhiteList || '',
      attrWhiteList: data?.attrWhiteList || '',
    },
  });

  const watchIsEnabledXss = xssFormMethods.watch('isEnabledXss');

  const submitHandler = async(formValues) => {
    if (watchIsEnabledXss) {
      const { tagWhiteList, attrWhiteList } = formValues;
      formValues.tagWhiteList = Array.isArray(tagWhiteList) ? tagWhiteList : tagWhiteList.split(',');
      formValues.attrWhiteList = Array.isArray(attrWhiteList) ? attrWhiteList : attrWhiteList.split(',');
    }
    try {
      await apiv3Put('/markdown-setting/xss', formValues);
      mutate();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.xss_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  useEffect(() => {
    xssFormMethods.setValue('isEnabledXss', data?.isEnabledXss);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.isEnabledXss]);

  useEffect(() => {
    // Cast to a string value because radio not work with int value with react-hook-form
    xssFormMethods.setValue('xssOption', String(data?.xssOption));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.xssOption]);

  useEffect(() => {
    xssFormMethods.setValue('tagWhiteList', data?.tagWhiteList || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.tagWhiteList]);

  useEffect(() => {
    xssFormMethods.setValue('tagWhiteList', data?.attrWhiteList || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.attrWhiteList]);

  function xssOptions() {
    return (
      <div className="form-group col-12 my-3">
        <div className="row">
          <div className="col-md-4 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio ">
              <input
                type="radio"
                className="custom-control-input"
                id="xssOption1"
                name="xssOption"
                value="1"
                ref={xssFormMethods.register}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption1">
                <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.remove_all_tags')}</p>
                <div className="mt-4">
                  {t('admin:markdown_setting.xss_options.remove_all_tags_desc')}
                </div>
              </label>
            </div>
          </div>

          <div className="col-md-4 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio">
              <input
                type="radio"
                className="custom-control-input"
                id="xssOption2"
                name="xssOption"
                value="2"
                ref={xssFormMethods.register}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption2">
                <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.recommended_setting')}</p>
                <div className="mt-4">
                  <div className="d-flex justify-content-between">
                    {t('admin:markdown_setting.xss_options.tag_names')}
                  </div>
                  <textarea
                    className="form-control xss-list"
                    name="recommendedTags"
                    rows="6"
                    cols="40"
                    readOnly
                    defaultValue={tags}
                  />
                </div>
                <div className="mt-4">
                  <div className="d-flex justify-content-between">
                    {t('admin:markdown_setting.xss_options.tag_attributes')}
                  </div>
                  <textarea
                    className="form-control xss-list"
                    name="recommendedAttrs"
                    rows="6"
                    cols="40"
                    readOnly
                    defaultValue={attrs}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="col-md-4 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio">
              <input
                type="radio"
                className="custom-control-input"
                id="xssOption3"
                name="xssOption"
                value="3"
                ref={xssFormMethods.register}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption3">
                <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.custom_whitelist')}</p>
                <WhiteListInput customizable />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <FormProvider {...xssFormMethods}>
      <form className="form-group col-12 my-2" onSubmit={xssFormMethods.handleSubmit(submitHandler)}>
        <div className="form-group">
          <div className="col-8 offset-4 my-3">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                type="checkbox"
                className="custom-control-input"
                id="XssEnable"
                name="isEnabledXss"
                ref={xssFormMethods.register}
              />
              <label className="custom-control-label w-100" htmlFor="XssEnable">
                {t('admin:markdown_setting.xss_options.enable_xss_prevention')}
              </label>
            </div>
          </div>
        </div>

        <div className="col-12">
          {watchIsEnabledXss && xssOptions()}
        </div>
        <div className="d-flex justify-content-center">
          <input type="submit" value={t('Update')} className="btn btn-primary" />
        </div>
      </form>
    </FormProvider>
  );

};

export default XssForm;
