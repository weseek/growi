/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

class PresentationForm extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <fieldset className="form-group row my-2">

        <label className="col-xs-3 control-label text-right">
          { t('markdown_setting.Page break setting') }
        </label>

        <div className="col-xs-3 radio radio-primary">
          <input type="radio" id="pageBreakOption1" name="pageBreakOption" value="1" checked={this.state.pageBreakOption === 1} onChange={this.handleInputChange} />
          <label htmlFor="pageBreakOption1">
            <p className="font-weight-bold">{ t('markdown_setting.Preset one separator') }</p>
            <p className="mt-3">
              { t('markdown_setting.Preset one separator desc') }
              <pre><code>{ t('markdown_setting.Preset one separator value') }</code></pre>
            </p>
          </label>
        </div>

        <div className="col-xs-3 radio radio-primary mt-3">
          <input type="radio" id="pageBreakOption2" name="pageBreakOption" value="2" checked={this.state.pageBreakOption === 2} onChange={this.handleInputChange} />
          <label htmlFor="pageBreakOption2">
            <p className="font-weight-bold">{ t('markdown_setting.Preset two separator') }</p>
            <p className="mt-3">
              { t('markdown_setting.Preset two separator desc') }
              <pre><code>{ t('markdown_setting.Preset two separator value') }</code></pre>
            </p>
          </label>
        </div>

        <div className="col-xs-3 radio radio-primary mt-3">
          <input type="radio" id="pageBreakOption3" name="pageBreakOption" value="3" checked={this.state.pageBreakOption === 3} onChange={this.handleInputChange} />
          <label htmlFor="pageBreakOption3">
            <p className="font-weight-bold">{ t('markdown_setting.Custom separator') }</p>
            <p className="mt-3">
              { t('markdown_setting.Custom separator desc') }
              <div>
                <input className="form-control" name="customRegularExpression" value={this.state.customRegularExpression} onChange={this.handleInputChange} />
              </div>
            </p>
          </label>
        </div>

        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
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
