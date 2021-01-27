import React, { useState } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { useTranslation } from '~/i18n';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import { apiv3Put } from '../../../util/apiv3-client';

const logger = loggerFactory('growi:markdown:presentation');

const PresentationForm = (props) => {
  const { t } = useTranslation();
  const [pageBreakSeparator, setPageBreakSeparator] = useState(props.pageBreakSeparator);
  const [pageBreakCustomSeparator, setPageBreakCustomSeparator] = useState(props.pageBreakCustomSeparator);

  async function onClickSubmit() {
    try {
      await apiv3Put('/markdown-setting/presentation', { pageBreakSeparator, pageBreakCustomSeparator });
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.presentation_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  return (
    <fieldset className="form-group col-12 my-2">

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
                name="presentation"
                checked={pageBreakSeparator === 1}
                onChange={() => { setPageBreakSeparator(1) }}
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
                name="presentation"
                checked={pageBreakSeparator === 2}
                onChange={() => { setPageBreakSeparator(2) }}
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
                name="presentation"
                checked={pageBreakSeparator === 3}
                onChange={() => { setPageBreakSeparator(3) }}
              />
              <label className="custom-control-label w-100" htmlFor="pageBreakOption3">
                <p className="font-weight-bold">{ t('admin:markdown_setting.presentation_options.custom_separator') }</p>
                <div className="mt-3">
                  { t('admin:markdown_setting.presentation_options.custom_separator_desc') }
                  <input
                    className="form-control"
                    defaultValue={pageBreakCustomSeparator}
                    onChange={(e) => { setPageBreakCustomSeparator(e.target.value) }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <AdminUpdateButtonRow onClick={onClickSubmit} />
    </fieldset>
  );

};

PresentationForm.propTypes = {
  pageBreakSeparator: PropTypes.number,
  pageBreakCustomSeparator: PropTypes.string,
};
export default PresentationForm;
