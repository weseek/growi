import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

const logger = loggerFactory('growi:importer');

class PresentationForm extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    try {
      await this.props.markDownSettingContainer.updatePresentationSetting();
      toastSuccess('Success update Presentation setting');
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }


  render() {
    const { t, markDownSettingContainer } = this.props;
    const { /* pageBreakSeparator, */ pageBreakCustomSeparator } = markDownSettingContainer.state;

    return (
      <fieldset className="form-group row my-2">

        <label className="col-xs-3 control-label text-right">
          { t('markdown_setting.Page break setting') }
        </label>

        <div className="col-xs-3 radio radio-primary">
          <input
            type="radio"
            id="pageBreakOption1"
            // checked={pageBreakSeparator === 1}
            // onChange={() => { markDownSettingContainer.setState({ pageBreakSeparator: 1 }) }}
            isSelected={markDownSettingContainer.state.pageBreakSeparator === 1}
            onSelected={() => markDownSettingContainer.switchPageBreakSeparator(1)}
          />
          <label htmlFor="pageBreakOption1">
            <p className="font-weight-bold">{ t('markdown_setting.Preset one separator') }</p>
            <div className="mt-3">
              { t('markdown_setting.Preset one separator desc') }
              <pre><code>{ t('markdown_setting.Preset one separator value') }</code></pre>
            </div>
          </label>
        </div>

        <div className="col-xs-3 radio radio-primary mt-3">
          <input
            type="radio"
            id="pageBreakOption2"
            // checked={pageBreakSeparator === 2}
            // onChange={() => { markDownSettingContainer.setState({ pageBreakSeparator: 2 }) }}
            isSelected={markDownSettingContainer.state.pageBreakSeparator === 2}
            onSelected={() => markDownSettingContainer.switchPageBreakSeparator(2)}
          />
          <label htmlFor="pageBreakOption2">
            <p className="font-weight-bold">{ t('markdown_setting.Preset two separator') }</p>
            <div className="mt-3">
              { t('markdown_setting.Preset two separator desc') }
              <pre><code>{ t('markdown_setting.Preset two separator value') }</code></pre>
            </div>
          </label>
        </div>

        <div className="col-xs-3 radio radio-primary mt-3">
          <input
            type="radio"
            id="pageBreakOption3"
            // checked={pageBreakSeparator === 3}
            // onChange={() => { markDownSettingContainer.setState({ pageBreakSeparator: 3 }) }}
            isSelected={markDownSettingContainer.state.pageBreakSeparator === 3}
            onSelected={() => markDownSettingContainer.switchPageBreakSeparator(3)}
          />
          <label htmlFor="pageBreakOption3">
            <p className="font-weight-bold">{ t('markdown_setting.Custom separator') }</p>
            <div className="mt-3">
              { t('markdown_setting.Custom separator desc') }
              <input
                className="form-control"
                value={pageBreakCustomSeparator}
                onChange={(e) => { markDownSettingContainer.setState({ pageBreakCustomSeparator: e.target.value }) }}
              />
            </div>
          </label>
        </div>

        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <div className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</div>
          </div>
        </div>

      </fieldset>
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
