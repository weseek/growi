import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';


class LineBreakSetting extends React.Component {

  constructor(props) {
      super(props);
  
      const { appContainer } = this.props;
  
      this.state = {
        isEnabledLinebreaks: appContainer.config.isEnabledLinebreaks,
        isEnabledLinebreaksInComments: appContainer.config.isEnabledLinebreaksInComments,
      };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.changeLineBreakSetting = this.changeLineBreakSetting.bind(this);
  }


  handleInputChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  }

  async changeLineBreakSetting () {
      const { appContainer } = this.props;
      const params = {
        isEnabledLinebreaks: this.state.isEnabledLinebreaks,
        isEnabledLinebreaksInComments: this.state.isEnabledLinebreaksInComments,
      };
      try {
        await appContainer.apiPost('/admin/markdown/lineBreaksSetting', { params });
        toastSuccess('Success change line braek setting');
      }
      catch (err) {
        toastError(err);
      }
  }


  render() {
    const { t } = this.props;
  
    return (
      <React.Fragment>
        <div className="row my-3">
          <div className="form-group">
            <legend>{ t('markdown_setting.line_break_setting') }</legend>
              <p className="well">{ t('markdown_setting.line_break_setting_desc') }</p>
              <fieldset className="row">
                <div className="form-group">
                  <label className="col-xs-4 control-label text-right">
                    { t('markdown_setting.Enable Line Break') }
                  </label>
                  <div className="col-xs-5">
                    <input type="checkbox" name="isEnabledLinebreaks" checked={this.state.isEnabledLinebreaks} onChange={this.handleInputChange} />
                    <p className="help-block">{ t('markdown_setting.Enable Line Break desc') }</p>
                  </div>
                </div>
              </fieldset>
              <fieldset className="row">
                <div className="form-group my-3">
                  <label className="col-xs-4 control-label text-right">
                    { t('markdown_setting.Enable Line Break for comment') }
                  </label>
                  <div className="col-xs-5">
                    <input type="checkbox" name="isEnabledLinebreaksInComments" checked={this.state.isEnabledLinebreaksInComments} onChange={this.handleInputChange} />
                    <p className="help-block">{ t('markdown_setting.Enable Line Break for comment desc') }</p>
                  </div>
                </div>
              </fieldset>
            </div>
            <div className="form-group my-3">
              <div className="col-xs-offset-4 col-xs-5">
                <button type="submit" className="btn btn-primary" onClick={this.changeLineBreakSetting}>{ t('Update') }</button>
              </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}  

/**
 * Wrapper component for using unstated
 */
const LineBreakSettingWrapper = (props) => {
  return createSubscribedElement(LineBreakSetting, props, [AppContainer]);
};

LineBreakSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(LineBreakSettingWrapper);
