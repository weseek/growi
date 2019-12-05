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
      <fieldset className="form-group col-xs-12 my-3">
        <div className="col-xs-4 radio radio-primary">
          <input
            type="radio"
            id="xssOption1"
            name="XssOption"
            checked={xssOption === 1}
            onChange={() => { adminMarkDownContainer.setState({ xssOption: 1 }) }}
          />
          <label htmlFor="xssOption1">
            <p className="font-weight-bold">{ t('markdown_setting.Ignore all tags') }</p>
            <div className="m-t-15">
              { t('markdown_setting.Ignore all tags desc') }
            </div>
          </label>
        </div>

        <div className="col-xs-4 radio radio-primary">
          <input
            type="radio"
            id="xssOption2"
            name="XssOption"
            checked={xssOption === 2}
            onChange={() => { adminMarkDownContainer.setState({ xssOption: 2 }) }}
          />
          <label htmlFor="xssOption2">
            <p className="font-weight-bold">{ t('markdown_setting.Recommended setting') }</p>
            <WhiteListInput customizable={false} />
          </label>
        </div>

        <div className="col-xs-4 radio radio-primary">
          <input
            type="radio"
            id="xssOption3"
            name="XssOption"
            checked={xssOption === 3}
            onChange={() => { adminMarkDownContainer.setState({ xssOption: 3 }) }}
          />
          <label htmlFor="xssOption3">
            <p className="font-weight-bold">{ t('markdown_setting.Custom Whitelist') }</p>
            <WhiteListInput customizable />
          </label>
        </div>
      </fieldset>
    );
  }

  render() {
    const { t, adminMarkDownContainer } = this.props;
    const { isEnabledXss } = adminMarkDownContainer.state;

    return (
      <React.Fragment>
        <form className="row">
          <div className="form-group">
            <div className="col-xs-offset-4 col-xs-4 text-left">
              <div className="checkbox checkbox-success">
                <input
                  type="checkbox"
                  id="XssEnable"
                  className="form-check-input"
                  name="isEnabledXss"
                  checked={isEnabledXss}
                  onChange={adminMarkDownContainer.switchEnableXss}
                />
                <label htmlFor="XssEnable">
                  { t('markdown_setting.Enable XSS prevention') }
                </label>
              </div>
            </div>
            {isEnabledXss && this.xssOptions()}
          </div>
          <div className="form-group my-3">
            <div className="col-xs-offset-4 col-xs-5">
              <div className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</div>
            </div>
          </div>
        </form>
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
