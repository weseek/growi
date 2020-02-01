import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

const logger = loggerFactory('growi:markdown:presentation');

class PresentationForm extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      await this.props.adminMarkDownContainer.updatePresentationSetting();
      toastSuccess(t('toaster.update_successed', { target: t('admin:markdown_setting.presentation_header') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }


  render() {
    const { t, adminMarkDownContainer } = this.props;
    const { pageBreakSeparator, pageBreakCustomSeparator } = adminMarkDownContainer.state;

    return (
      <fieldset className="form-group row my-2">

        <label className="col-xs-3 control-label text-right">
          {t('admin:markdown_setting.presentation_options.page_break_setting')}
        </label>

        <div className="col-xs-3 radio radio-primary">
          <input
            type="radio"
            id="pageBreakOption1"
            checked={pageBreakSeparator === 1}
            onChange={() => adminMarkDownContainer.switchPageBreakSeparator(1)}
          />
          <label htmlFor="pageBreakOption1">
            <p className="font-weight-bold">{t('admin:markdown_setting.presentation_options.preset_one_separator')}</p>
            <div className="mt-3">
              {t('admin:markdown_setting.presentation_options.preset_one_separator_desc')}
              <pre><code>{t('admin:markdown_setting.presentation_options.preset_one_separator_value')}</code></pre>
            </div>
          </label>
        </div>

        <div className="col-xs-3 radio radio-primary mt-3">
          <input
            type="radio"
            id="pageBreakOption2"
            checked={pageBreakSeparator === 2}
            onChange={() => adminMarkDownContainer.switchPageBreakSeparator(2)}
          />
          <label htmlFor="pageBreakOption2">
            <p className="font-weight-bold">{t('admin:markdown_setting.presentation_options.preset_two_separator')}</p>
            <div className="mt-3">
              {t('admin:markdown_setting.presentation_options.preset_two_separator_desc')}
              <pre><code>{t('admin:markdown_setting.presentation_options.preset_two_separator_value')}</code></pre>
            </div>
          </label>
        </div>

        <div className="col-xs-3 radio radio-primary mt-3">
          <input
            type="radio"
            id="pageBreakOption3"
            checked={pageBreakSeparator === 3}
            onChange={() => adminMarkDownContainer.switchPageBreakSeparator(3)}
          />
          <label htmlFor="pageBreakOption3">
            <p className="font-weight-bold">{t('admin:markdown_setting.presentation_options.custom_separator')}</p>
            <div className="mt-3">
              {t('admin:markdown_setting.presentation_options.custom_separator_desc')}
              <input
                className="form-control"
                defaultValue={pageBreakCustomSeparator}
                onChange={(e) => { adminMarkDownContainer.setPageBreakCustomSeparator(e.target.value) }}
              />
            </div>
          </label>
        </div>

        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <div className="btn btn-primary" onClick={this.onClickSubmit} disabled={adminMarkDownContainer.state.retrieveError != null}>{t('Update')}</div>
          </div>
        </div>

      </fieldset>
    );
  }

}

const PresentationFormWrapper = (props) => {
  return createSubscribedElement(PresentationForm, props, [AppContainer, AdminMarkDownContainer]);
};

PresentationForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,

};

export default withTranslation()(PresentationFormWrapper);
