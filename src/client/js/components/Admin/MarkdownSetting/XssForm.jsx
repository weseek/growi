import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

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
      await this.props.adminMarkDownContainer.updateXssSetting();
      toastSuccess(t('markdown_setting.updated_xss'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  xssOptions() {
    const { t, adminMarkDownContainer } = this.props;
    const { xssOption } = adminMarkDownContainer.state;

    return (
      <div className="form-group form-check-inline col-xs-12 my-3">
        <div className="col-xs-4 align-self-start">
          <div className="custom-control custom-radio ">
            <input
              type="radio"
              className="custom-control-input"
              id="xssOption1"
              name="XssOption"
              checked={xssOption === 1}
              onChange={() => { adminMarkDownContainer.setState({ xssOption: 1 }) }}
            />
            <label className="custom-control-label" htmlFor="xssOption1">
              <p className="font-weight-bold">{ t('markdown_setting.Ignore all tags') }</p>
              <div className="mt-4">
                { t('markdown_setting.Ignore all tags desc') }
              </div>
            </label>
          </div>
        </div>

        <div className="col-xs-4 align-self-start">
          <div className="custom-control custom-radio">
            <input
              type="radio"
              className="custom-control-input"
              id="xssOption2"
              name="XssOption"
              checked={xssOption === 2}
              onChange={() => { adminMarkDownContainer.setState({ xssOption: 2 }) }}
            />
            <label className="custom-control-label" htmlFor="xssOption2">
              <p className="font-weight-bold">{ t('markdown_setting.Recommended setting') }</p>
              <WhiteListInput customizable={false} />
            </label>
          </div>
        </div>

        <div className="col-xs-4 align-self-start">
          <div className="custom-control custom-radio">
            <input
              type="radio"
              className="custom-control-input"
              id="xssOption3"
              name="XssOption"
              checked={xssOption === 3}
              onChange={() => { adminMarkDownContainer.setState({ xssOption: 3 }) }}
            />
            <label className="custom-control-label" htmlFor="xssOption3">
              <p className="font-weight-bold">{ t('markdown_setting.Custom Whitelist') }</p>
              <WhiteListInput customizable />
            </label>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { t, adminMarkDownContainer } = this.props;
    const { isEnabledXss } = adminMarkDownContainer.state;

    return (
      <React.Fragment>
        <fieldset className="form-group mx-auto my-3">

          <div className="col-xs-offset-4 col-xs-6 text-center">
            <div className="custom-control custom-switch checkbox-success">
              <input
                type="checkbox"
                className="custom-control-input"
                id="XssEnable"
                name="isEnabledXss"
                checked={isEnabledXss}
                onChange={adminMarkDownContainer.switchEnableXss}
              />
              <label className="custom-control-label" htmlFor="XssEnable">
                { t('markdown_setting.Enable XSS prevention') }
              </label>
            </div>
          </div>

          <div className="col-xs-offset-4 col-xs-6 mx-auto">
            {isEnabledXss && this.xssOptions()}
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

const XssFormWrapper = (props) => {
  return createSubscribedElement(XssForm, props, [AppContainer, AdminMarkDownContainer]);
};

XssForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default withTranslation()(XssFormWrapper);
