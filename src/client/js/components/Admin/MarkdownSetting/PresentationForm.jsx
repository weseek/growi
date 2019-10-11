import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

class PresentationForm extends React.Component {

  renderLineBreakOptions() {
    const { t, markDownSettingContainer } = this.props;
    const { pageBreakOption, customRegularExpression } = markDownSettingContainer.state;

    return (
      <Fragment>
        <div className="col-xs-3 radio radio-primary">
          <input
            type="radio"
            id="pageBreakOption1"
            checked={pageBreakOption === 1}
            onChange={() => { markDownSettingContainer.setState({ pageBreakOption: 1 }) }}
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
            checked={pageBreakOption === 2}
            onChange={() => { markDownSettingContainer.setState({ pageBreakOption: 2 }) }}
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
            checked={pageBreakOption === 3}
            onChange={() => { markDownSettingContainer.setState({ pageBreakOption: 3 }) }}
          />
          <label htmlFor="pageBreakOption3">
            <p className="font-weight-bold">{ t('markdown_setting.Custom separator') }</p>
            <div className="mt-3">
              { t('markdown_setting.Custom separator desc') }
              <input
                className="form-control"
                value={customRegularExpression}
                onChange={(e) => { markDownSettingContainer.setState({ customRegularExpression: e.target.value }) }}
              />
            </div>
          </label>
        </div>
      </Fragment>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <fieldset className="form-group row my-2">

        <label className="col-xs-3 control-label text-right">
          { t('markdown_setting.Page break setting') }
        </label>
        {/* create option as component if increase */}
        {this.renderLineBreakOptions()}
        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            {/* TODO GW-220 create function */}
            <button type="submit" className="btn btn-primary">{ t('Update') }</button>
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
