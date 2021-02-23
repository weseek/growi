import React, { FC, useEffect } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';

import loggerFactory from '~/utils/logger';
import { useTranslation } from '~/i18n';

import { tags, attrs } from '~/service/xss/recommended-whitelist';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { useMarkdownSettingsSWR } from '~/stores/admin';

import { WhiteListInput } from './WhiteListInput';
import { apiv3Put } from '~/utils/apiv3-client';

const logger = loggerFactory('growi:importer');

const isEnabledXssInputName = 'isEnabledXss';
const xssOptionInputName = 'xssOption';
const tagWhiteListInputName = 'tagWhiteList';
const attrWhiteListInputName = 'attrWhiteList';

type FormValues = {
  [isEnabledXssInputName]: boolean,
  // Cast to a string value because radio not work with int value with react-hook-form
  [xssOptionInputName]: string,
  [tagWhiteListInputName]: any,
  [attrWhiteListInputName]: any
}

export const XssForm:FC = () => {
  const { t } = useTranslation();
  const { data, mutate } = useMarkdownSettingsSWR();

  const xssFormMethods = useForm({
    defaultValues: {
      [isEnabledXssInputName]: data?.[isEnabledXssInputName],
      // Cast to a string value because radio not work with int value with react-hook-form
      [xssOptionInputName]: String(data?.[xssOptionInputName]),
      [tagWhiteListInputName]: data?.[tagWhiteListInputName] || '',
      [attrWhiteListInputName]: data?.[attrWhiteListInputName] || '',
    },
  });

  const watchIsEnabledXss = xssFormMethods.watch(isEnabledXssInputName);

  const submitHandler:SubmitHandler<FormValues> = async(formValues:FormValues) => {
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
    xssFormMethods.setValue(isEnabledXssInputName, data?.[isEnabledXssInputName]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[isEnabledXssInputName]]);

  useEffect(() => {
    // Cast to a string value because radio not work with int value with react-hook-form
    xssFormMethods.setValue(xssOptionInputName, String(data?.[xssOptionInputName]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[xssOptionInputName]]);

  useEffect(() => {
    xssFormMethods.setValue(tagWhiteListInputName, data?.[tagWhiteListInputName] || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[tagWhiteListInputName]]);

  useEffect(() => {
    xssFormMethods.setValue(attrWhiteListInputName, data?.[attrWhiteListInputName] || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[attrWhiteListInputName]]);

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
                name={xssOptionInputName}
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
                name={xssOptionInputName}
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
                    rows={6}
                    cols={40}
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
                    rows={6}
                    cols={40}
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
                name={xssOptionInputName}
                value="3"
                ref={xssFormMethods.register}
              />
              <label className="custom-control-label w-100" htmlFor="xssOption3">
                <p className="font-weight-bold">{t('admin:markdown_setting.xss_options.custom_whitelist')}</p>
                <WhiteListInput />
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
                name={isEnabledXssInputName}
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
          <button type="submit" className="btn btn-primary">{ t('Update') }</button>
        </div>
      </form>
    </FormProvider>
  );

};
