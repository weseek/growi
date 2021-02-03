import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import loggerFactory from '@alias/logger';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { useTranslation } from '~/i18n';
import { useMarkdownSettingsSWR } from '~/stores/admin';

import { apiv3Put } from '../../../util/apiv3-client';

const logger = loggerFactory('growi:markdown:presentation');

const PresentationForm = (props) => {
  const { t } = useTranslation();
  const { data, mutate } = useMarkdownSettingsSWR();
  const PresentationFormMethods = useForm({
    defaultValues: {
      // Cast to a string value because radio not work with int value with react-hook-form
      pageBreakSeparator: String(data?.pageBreakSeparator),
      pageBreakCustomSeparator: data?.pageBreakCustomSeparator,
    },
  });

  const submitHandler = async(formValues) => {
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
    PresentationFormMethods.setValue('pageBreakSeparator', String(data?.pageBreakSeparator));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.pageBreakSeparator]);

  useEffect(() => {
    PresentationFormMethods.setValue('pageBreakCustomSeparator', data?.pageBreakCustomSeparator);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.pageBreakCustomSeparator]);

  return (
    <form className="form-group col-12 my-2" onSubmit={PresentationFormMethods.handleSubmit(submitHandler)}>

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
                name="pageBreakSeparator"
                value="1"
                ref={PresentationFormMethods.register}
              />
              <label className="custom-control-label w-100" htmlFor="pageBreakOption1">
                <p className="font-weight-bold">{ t('admin:markdown_setting.presentation_options.preset_one_separator') }</p>
                <div className="mt-3">
                  { t('admin:markdown_setting.presentation_options.preset_one_separator_desc') }
                  <input
                    className="form-control"
                    type="text"
                    value={t('admin:markdown_setting.presentation_options.preset_one_separator_value')}
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
                name="pageBreakSeparator"
                value="2"
                ref={PresentationFormMethods.register}
              />
              <label className="custom-control-label w-100" htmlFor="pageBreakOption2">
                <p className="font-weight-bold">{ t('admin:markdown_setting.presentation_options.preset_two_separator') }</p>
                <div className="mt-3">
                  { t('admin:markdown_setting.presentation_options.preset_two_separator_desc') }
                  <input
                    className="form-control"
                    type="text"
                    value={t('admin:markdown_setting.presentation_options.preset_two_separator_value')}
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
                name="pageBreakSeparator"
                value="3"
                ref={PresentationFormMethods.register}
              />
              <label className="custom-control-label w-100" htmlFor="pageBreakOption3">
                <p className="font-weight-bold">{ t('admin:markdown_setting.presentation_options.custom_separator') }</p>
                <div className="mt-3">
                  { t('admin:markdown_setting.presentation_options.custom_separator_desc') }
                  <input
                    className="form-control"
                    name="pageBreakCustomSeparator"
                    ref={PresentationFormMethods.register}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <input type="submit" value={t('Update')} className="btn btn-primary" />
      </div>
    </form>
  );

};

export default PresentationForm;
