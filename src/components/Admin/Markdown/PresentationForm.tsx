import React, { FC, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import loggerFactory from '~/utils/logger';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { useTranslation } from '~/i18n';
import { useMarkdownSettingsSWR } from '~/stores/admin';

import { apiv3Put } from '~/utils/apiv3-client';

const logger = loggerFactory('growi:markdown:presentation');

const pageBreakSeparatorInputName = 'pageBreakSeparator';
const pageBreakCustomSeparatorInputName = 'pageBreakCustomSeparator';

type FormValues = {
  // Cast to a string value because radio not work with int value with react-hook-form
  [pageBreakSeparatorInputName]: string
  [pageBreakCustomSeparatorInputName]: string,
};

export const PresentationForm:FC = () => {
  const { t } = useTranslation();
  const { data, mutate } = useMarkdownSettingsSWR();
  const { register, setValue, handleSubmit } = useForm({
    defaultValues: {
      // Cast to a string value because radio not work with int value with react-hook-form
      [pageBreakSeparatorInputName]: String(data?.[pageBreakSeparatorInputName]),
      [pageBreakCustomSeparatorInputName]: data?.[pageBreakCustomSeparatorInputName],
    },
  });

  const submitHandler:SubmitHandler<FormValues> = async(formValues:FormValues) => {
    try {
      await apiv3Put('/markdown-setting/presentation', formValues);
      mutate();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.presentation_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  useEffect(() => {
    // Cast to a string value because radio not work with int value with react-hook-form
    setValue(pageBreakSeparatorInputName, String(data?.[pageBreakSeparatorInputName]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[pageBreakSeparatorInputName]]);

  useEffect(() => {
    setValue(pageBreakCustomSeparatorInputName, data?.[pageBreakCustomSeparatorInputName]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[pageBreakCustomSeparatorInputName]]);

  return (
    <form className="form-group col-12 my-2" onSubmit={handleSubmit(submitHandler)}>

      <label className="col-8 offset-4 col-form-label font-weight-bold text-left mt-3">
        {t('admin:markdown_setting.presentation_options.page_break_setting')}
      </label>

      <div className="form-group col-12 my-3">
        <div className="row">
          <div className="col-md-4 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio">
              <input
                type="radio"
                className="custom-control-input"
                id="pageBreakOption1"
                name={pageBreakSeparatorInputName}
                value="1"
                ref={register}
              />
              <label className="custom-control-label w-100" htmlFor="pageBreakOption1">
                <p className="font-weight-bold">{ t('admin:markdown_setting.presentation_options.preset_one_separator') }</p>
                <div className="mt-3">
                  { t('admin:markdown_setting.presentation_options.preset_one_separator_desc') }
                  <input
                    className="form-control"
                    type="text"
                    value={t('admin:markdown_setting.presentation_options.preset_one_separator_value').toString()}
                    readOnly
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
                id="pageBreakOption2"
                name={pageBreakSeparatorInputName}
                value="2"
                ref={register}
              />
              <label className="custom-control-label w-100" htmlFor="pageBreakOption2">
                <p className="font-weight-bold">{ t('admin:markdown_setting.presentation_options.preset_two_separator') }</p>
                <div className="mt-3">
                  { t('admin:markdown_setting.presentation_options.preset_two_separator_desc') }
                  <input
                    className="form-control"
                    type="text"
                    value={t('admin:markdown_setting.presentation_options.preset_two_separator_value').toString()}
                    readOnly
                  />
                </div>
              </label>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 align-self-start mb-4">
            <div className="custom-control custom-radio">
              <input
                type="radio"
                id="pageBreakOption3"
                className="custom-control-input"
                name={pageBreakSeparatorInputName}
                value="3"
                ref={register}
              />
              <label className="custom-control-label w-100" htmlFor="pageBreakOption3">
                <p className="font-weight-bold">{ t('admin:markdown_setting.presentation_options.custom_separator') }</p>
                <div className="mt-3">
                  { t('admin:markdown_setting.presentation_options.custom_separator_desc') }
                  <input
                    className="form-control"
                    name={pageBreakCustomSeparatorInputName}
                    ref={register}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <button type="submit" className="btn btn-primary">{ t('Update') }</button>
      </div>
    </form>
  );

};
