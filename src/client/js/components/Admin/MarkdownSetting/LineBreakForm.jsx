/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

const logger = loggerFactory('growi:importer');

class LineBreakForm extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    try {
      await this.props.markDownSettingContainer.updateLineBreakSetting();
      toastSuccess('Success update line braek setting');
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }


  render() {
    const { t, markDownSettingContainer } = this.props;
    const { isEnabledLinebreaks, isEnabledLinebreaksInComments } = markDownSettingContainer.state;

    return (
      <React.Fragment>
        <fieldset className="row">
          <div className="form-group">
            <div className="col-xs-4 text-right">
              <div className="checkbox checkbox-success" onChange={() => { markDownSettingContainer.setState({ isEnabledLinebreaks: !isEnabledLinebreaks }) }}>
                <input type="checkbox" name="isEnabledLinebreaks" checked={isEnabledLinebreaks} />
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
              <div className="checkbox checkbox-success" onChange={() => { markDownSettingContainer.setState({ isEnabledLinebreaksInComments: !isEnabledLinebreaksInComments }) }}>
                <input type="checkbox" name="isEnabledLinebreaksInComments" checked={isEnabledLinebreaksInComments} />
                <label>
                  { t('markdown_setting.Enable Line Break for comment') }
                </label>
                <p className="help-block">{ t('markdown_setting.Enable Line Break for comment desc') }</p>
              </div>
            </div>
          </div>
        </fieldset>
        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button type="submit" className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</button>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LineBreakFormWrapper = (props) => {
  return createSubscribedElement(LineBreakForm, props, [AppContainer, MarkDownSettingContainer]);
};

LineBreakForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  markDownSettingContainer: PropTypes.instanceOf(MarkDownSettingContainer).isRequired,
};

export default withTranslation()(LineBreakFormWrapper);
