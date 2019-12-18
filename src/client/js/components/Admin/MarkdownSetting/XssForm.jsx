import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

import WhiteListInput from './WhiteListInput';

const logger = loggerFactory('growi:importer');

class XssForm extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      await this.props.markDownSettingContainer.updateXssSetting();
      toastSuccess(t('markdown_setting.updated_xss'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  xssOptions() {
    const { t, markDownSettingContainer } = this.props;
    const { xssOption } = markDownSettingContainer.state;

    return (
      <div className="form-group form-check-inline col-xs-12 my-3">
        <div className="col-xs-4 align-self-start radio radio-primary">
          <input
            type="radio"
            id="xssOption1"
            name="XssOption"
            checked={xssOption === 1}
            onChange={() => { markDownSettingContainer.setState({ xssOption: 1 }) }}
          />
          <label htmlFor="xssOption1">
            <p className="font-weight-bold">{ t('markdown_setting.Ignore all tags') }</p>
            <div className="mt-4">
              { t('markdown_setting.Ignore all tags desc') }
            </div>
          </label>
        </div>

        <div className="col-xs-4 align-self-start radio radio-primary">
          <input
            type="radio"
            id="xssOption2"
            name="XssOption"
            checked={xssOption === 2}
            onChange={() => { markDownSettingContainer.setState({ xssOption: 2 }) }}
          />
          <label htmlFor="xssOption2">
            <p className="font-weight-bold">{ t('markdown_setting.Recommended setting') }</p>
            <WhiteListInput customizable={false} />
          </label>
        </div>

        <div className="col-xs-4 align-self-start radio radio-primary">
          <input
            type="radio"
            id="xssOption3"
            name="XssOption"
            checked={xssOption === 3}
            onChange={() => { markDownSettingContainer.setState({ xssOption: 3 }) }}
          />
          <label htmlFor="xssOption3">
            <p className="font-weight-bold">{ t('markdown_setting.Custom Whitelist') }</p>
            <WhiteListInput customizable />
          </label>
        </div>
      </div>
    );
  }

  render() {
    const { t, markDownSettingContainer } = this.props;
    const { isEnabledXss } = markDownSettingContainer.state;

    return (
      <React.Fragment>
        <fieldset className="form-group mx-auto my-3">
          <div className="col-xs-offset-4 col-xs-6 text-left">
            <div className="custom-control custom-switch checkbox-success">
              <input
                type="checkbox"
                className="custom-control-input"
                id="XssEnable"
                name="isEnabledXss"
                checked={isEnabledXss}
                onChange={markDownSettingContainer.switchEnableXss}
              />
              <label className="custom-control-label" htmlFor="XssEnable">
                { t('markdown_setting.Enable XSS prevention') }
              </label>
            </div>
          </div>
          {isEnabledXss && this.xssOptions()}
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

const XssFormWrapper = (props) => {
  return createSubscribedElement(XssForm, props, [AppContainer, MarkDownSettingContainer]);
};

XssForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  markDownSettingContainer: PropTypes.instanceOf(MarkDownSettingContainer).isRequired,
};

export default withTranslation()(XssFormWrapper);
