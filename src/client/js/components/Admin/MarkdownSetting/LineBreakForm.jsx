import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { useTranslation } from '~/i18n';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import { apiv3Put } from '../../../util/apiv3-client';

const logger = loggerFactory('growi:importer');

const LineBreakForm = (props) => {
  const { t } = useTranslation();

  const [isEnabledLinebreaks, setIsEnabledLinebreaks] = useState(props.isEnabledLinebreaks);
  const [isEnabledLinebreaksInComments, setIsEnabledLinebreaksInComments] = useState(props.isEnabledLinebreaksInComments);

  async function onClickSubmit() {
    try {
      await apiv3Put('/markdown-setting/lineBreak', { isEnabledLinebreaks, isEnabledLinebreaksInComments });
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.lineBreak_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  function renderLineBreakOption() {
    const helpLineBreak = { __html: t('admin:markdown_setting.lineBreak_options.enable_lineBreak_desc') };

    return (
      <div className="col">
        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            type="checkbox"
            className="custom-control-input"
            id="isEnabledLinebreaks"
            checked={isEnabledLinebreaks}
            onChange={() => { setIsEnabledLinebreaks(!isEnabledLinebreaks) }}
          />
          <label className="custom-control-label" htmlFor="isEnabledLinebreaks">
            {t('admin:markdown_setting.lineBreak_options.enable_lineBreak') }
          </label>
        </div>
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
            className="custom-control-input"
            id="isEnabledLinebreaksInComments"
            checked={isEnabledLinebreaksInComments}
            onChange={() => { setIsEnabledLinebreaksInComments(!isEnabledLinebreaksInComments) }}
          />
          <label className="custom-control-label" htmlFor="isEnabledLinebreaksInComments">
            {t('admin:markdown_setting.lineBreak_options.enable_lineBreak_for_comment') }
          </label>
        </div>
        <p className="form-text text-muted" dangerouslySetInnerHTML={helpLineBreakInComment} />
      </div>
    );
  }

  return (
    <React.Fragment>
      <fieldset className="form-group row row-cols-1 row-cols-md-2 mx-3">
        {renderLineBreakOption()}
        {renderLineBreakInCommentOption()}
      </fieldset>
      <AdminUpdateButtonRow onClick={onClickSubmit} disabled={false} />
    </React.Fragment>
  );

};

LineBreakForm.propTypes = {
  isEnabledLinebreaks: PropTypes.bool,
  isEnabledLinebreaksInComments: PropTypes.bool,
};

export default LineBreakForm;
