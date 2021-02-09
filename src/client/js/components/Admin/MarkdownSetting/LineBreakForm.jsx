import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import loggerFactory from '@alias/logger';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { useTranslation } from '~/i18n';
import { useMarkdownSettingsSWR } from '~/stores/admin';

import { apiv3Put } from '../../../util/apiv3-client';

const logger = loggerFactory('growi:importer');

const isEnabledLinebreaksInputName = 'isEnabledLinebreaks';
const isEnabledLinebreaksInCommentsInputName = 'isEnabledLinebreaksInComments';

export const LineBreakForm = (props) => {
  const { t } = useTranslation();
  const { data, mutate } = useMarkdownSettingsSWR();
  const {
    register, setValue, handleSubmit, getValues,
  } = useForm({
    defaultValues: {
      [isEnabledLinebreaksInputName]: data?.[isEnabledLinebreaksInputName],
      [isEnabledLinebreaksInCommentsInputName]: data?.[isEnabledLinebreaksInCommentsInputName],
    },
  });

  const submitHandler = async(formValues) => {
    try {
      await apiv3Put('/markdown-setting/lineBreak', formValues);
      mutate();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.lineBreak_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  useEffect(() => {
    setValue(isEnabledLinebreaksInputName, data?.[isEnabledLinebreaksInputName]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[isEnabledLinebreaksInputName]]);

  useEffect(() => {
    setValue(isEnabledLinebreaksInCommentsInputName, data?.[isEnabledLinebreaksInCommentsInputName]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[isEnabledLinebreaksInCommentsInputName]]);

  function renderLineBreakOption() {
    const helpLineBreak = { __html: t('admin:markdown_setting.lineBreak_options.enable_lineBreak_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            type="checkbox"
            id="isEnabledLinebreaks"
            className="custom-control-input"
            name={isEnabledLinebreaksInputName}
            ref={register}
          />
          <label className="custom-control-label" htmlFor="isEnabledLinebreaks">
            {t('admin:markdown_setting.lineBreak_options.enable_lineBreak') }
          </label>
        </div>
        {/* eslint-disable-next-line react/no-danger */}
        <p className="form-text text-muted" dangerouslySetInnerHTML={helpLineBreak} />
      </div>
    );
  }

  function renderLineBreakInCommentOption() {
    const helpLineBreakInComment = { __html: t('admin:markdown_setting.lineBreak_options.enable_lineBreak_for_comment_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            type="checkbox"
            id="isEnabledLinebreaksInComments"
            className="custom-control-input"
            name={isEnabledLinebreaksInCommentsInputName}
            ref={register}
          />
          <label className="custom-control-label" htmlFor="isEnabledLinebreaksInComments">
            {t('admin:markdown_setting.lineBreak_options.enable_lineBreak_for_comment') }
          </label>
        </div>
        {/* eslint-disable-next-line react/no-danger */}
        <p className="form-text text-muted" dangerouslySetInnerHTML={helpLineBreakInComment} />
      </div>
    );
  }


  return (
    <React.Fragment>
      <form className="form-group" onSubmit={handleSubmit(submitHandler)}>
        <div className="row row-cols-1 row-cols-md-2 mx-3">
          {renderLineBreakOption()}
          {renderLineBreakInCommentOption()}
        </div>
        <div className="d-flex justify-content-center">
          <input type="submit" value={t('Update')} className="btn btn-primary" />
        </div>
      </form>
    </React.Fragment>
  );

};
