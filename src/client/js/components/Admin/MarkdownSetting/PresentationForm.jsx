import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

const logger = loggerFactory('growi:markdown:presentation');

class PresentationForm extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      await this.props.markDownSettingContainer.updatePresentationSetting();
      toastSuccess(t('markdown_setting.updated_presentation'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }


  render() {
    const { t, markDownSettingContainer } = this.props;
    const { pageBreakSeparator, pageBreakCustomSeparator } = markDownSettingContainer.state;

    return (
      <React.Fragment>
        <fieldset className="form-group mx-auto my-2">

          <p className="col-12 col-xs-3 control-label font-weight-bold text-left mt-3">
            { t('markdown_setting.Page break setting') }
          </p>

          <div className="form-group form-check-inline mx-auto col-xs-12 my-3">
            <div className="col-4 align-self-start">
              <div className="custom-control custom-radio">
                <input
                  type="radio"
                  className="custom-control-input"
                  id="pageBreakOption1"
                  checked={pageBreakSeparator === 1}
                  onChange={() => markDownSettingContainer.switchPageBreakSeparator(1)}
                />
                <label className="custom-control-label" htmlFor="pageBreakOption1">
                  <p className="font-weight-bold">{ t('markdown_setting.Preset one separator') }</p>
                  <div className="mt-3">
                    { t('markdown_setting.Preset one separator desc') }
                    <pre><code>{ t('markdown_setting.Preset one separator value') }</code></pre>
                  </div>
                </label>
              </div>
            </div>
            <div className="col-4 align-self-start">
              <div className="custom-control custom-radio">
                <input
                  type="radio"
                  className="custom-control-input"
                  id="pageBreakOption2"
                  checked={pageBreakSeparator === 2}
                  onChange={() => markDownSettingContainer.switchPageBreakSeparator(2)}
                />
                <label className="custom-control-label" htmlFor="pageBreakOption2">
                  <p className="font-weight-bold">{ t('markdown_setting.Preset two separator') }</p>
                  <div className="mt-3">
                    { t('markdown_setting.Preset two separator desc') }
                    <pre><code>{ t('markdown_setting.Preset two separator value') }</code></pre>
                  </div>
                </label>
              </div>
            </div>
            <div className="col-4 align-self-start">
              <div className="custom-control custom-radio">
                <input
                  type="radio"
                  id="pageBreakOption3"
                  className="custom-control-input"
                  checked={pageBreakSeparator === 3}
                  onChange={() => markDownSettingContainer.switchPageBreakSeparator(3)}
                />
                <label className="custom-control-label" htmlFor="pageBreakOption3">
                  <p className="font-weight-bold">{ t('markdown_setting.Custom separator') }</p>
                  <div className="mt-3">
                    { t('markdown_setting.Custom separator desc') }
                    <input
                      className="form-control"
                      value={pageBreakCustomSeparator}
                      onChange={(e) => { markDownSettingContainer.setPageBreakCustomSeparator(e.target.value) }}
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </fieldset>
        <div className="form-group col-12 text-center my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button type="submit" className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</button>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

const PresentationFormWrapper = (props) => {
  return createSubscribedElement(PresentationForm, props, [AppContainer, MarkDownSettingContainer]);
};

PresentationForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  markDownSettingContainer: PropTypes.instanceOf(MarkDownSettingContainer).isRequired,

};

export default withTranslation()(PresentationFormWrapper);
