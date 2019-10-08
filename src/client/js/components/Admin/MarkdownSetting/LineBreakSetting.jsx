import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

const logger = loggerFactory('growi:importer');

class LineBreakSetting extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;

    this.state = {
      isEnabledLinebreaks: appContainer.config.isEnabledLinebreaks,
      isEnabledLinebreaksInComments: appContainer.config.isEnabledLinebreaksInComments,
    };
    this.onChangeEnableLineBreaks = this.onChangeEnableLineBreaks.bind(this);
    this.onChangeEnableLineBreaksInComments = this.onChangeEnableLineBreaksInComments.bind(this);
    this.changeLineBreakSettings = this.changeLineBreakSettings.bind(this);
  }


  onChangeEnableLineBreaks() {
    this.setState({ isEnabledLinebreaks: !this.state.isEnabledLinebreaks });
  }

  onChangeEnableLineBreaksInComments() {
    this.setState({ isEnabledLinebreaksInComments: !this.state.isEnabledLinebreaksInComments });
  }

  async changeLineBreakSettings() {
    const { appContainer } = this.props;
    const params = {
      isEnabledLinebreaks: this.state.isEnabledLinebreaks,
      isEnabledLinebreaksInComments: this.state.isEnabledLinebreaksInComments,
    };
    try {
      await appContainer.apiPost('/admin/markdown/lineBreaksSetting', { params });
      toastSuccess('Success update line braek setting');
    }
    catch (err) {
      toastError(err);
      logger.error(err);
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
                <div className="col-xs-4 text-right">
                  <div className="checkbox checkbox-success" onChange={this.onChangeEnableLineBreaks}>
                    <input type="checkbox" name="isEnabledLinebreaks" checked={this.state.isEnabledLinebreaks} />
                    <label>
                      { t('markdown_setting.Enable Line Break') }
                    </label>
                    <p className="help-block">{ t('markdown_setting.Enable Line Break desc') }</p>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset className="row">
              <div className="form-group my-3">
                <div className="col-xs-4 text-right">
                  <div className="checkbox checkbox-success" onChange={this.onChangeEnableLineBreaksInComments}>
                    <input type="checkbox" name="isEnabledLinebreaksInComments" checked={this.state.isEnabledLinebreaksInComments} />
                    <label>
                      { t('markdown_setting.Enable Line Break for comment') }
                    </label>
                    <p className="help-block">{ t('markdown_setting.Enable Line Break for comment desc') }</p>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
          <div className="form-group my-3">
            <div className="col-xs-offset-4 col-xs-5">
              <button type="submit" className="btn btn-primary" onClick={this.changeLineBreakSettings}>{ t('Update') }</button>
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
