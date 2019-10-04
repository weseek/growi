/* eslint-disable react/no-unused-state */
/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

import WhiteListInput from './WhiteListInput';

class XssForm extends React.Component {

  constructor(props) {
    super(props);

    this.onChangeTagWhiteList = this.onChangeTagWhiteList.bind(this);
    this.onChangeAttrWhiteList = this.onChangeAttrWhiteList.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  onChangeTagWhiteList(value) {
    this.setState({ tagWhiteList: value });
  }

  onChangeAttrWhiteList(value) {
    this.setState({ attrWhiteList: value });
  }

  async onClickSubmit() {
    // TODO GW-303 create apiV3 of update setting
  }

  xssOptions() {
    const { t, markDownSettingContainer } = this.props;

    return (
      <fieldset className="form-group col-xs-12 my-3">
        <div className="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption1" name="XssOption" onChange={() => { markDownSettingContainer.onChangeXssOption(1) }} />
          <label htmlFor="xssOption1">
            <p className="font-weight-bold">{ t('markdown_setting.Ignore all tags') }</p>
            <div className="m-t-15">
              { t('markdown_setting.Ignore all tags desc') }
            </div>
          </label>
        </div>

        <div className="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption2" name="XssOption" onChange={() => { markDownSettingContainer.onChangeXssOption(2) }} />
          <label htmlFor="xssOption2">
            <p className="font-weight-bold">{ t('markdown_setting.Recommended setting') }</p>
            <WhiteListInput customizable={false} />
          </label>
        </div>

        <div className="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption3" name="XssOption" onChange={() => { markDownSettingContainer.onChangeXssOption(3) }} />
          <label htmlFor="xssOption3">
            <p className="font-weight-bold">{ t('markdown_setting.Custom Whitelist') }</p>
            <WhiteListInput customizable onChangeTagWhiteList={this.onChangeTagWhiteList} onChangeAttrWhiteList={this.onChangeAttrWhiteList} />
          </label>
        </div>
      </fieldset>
    );
  }

  render() {
    const { t, markDownSettingContainer } = this.props;

    return (
      <React.Fragment>
        <form className="row">
          <div className="form-group">
            <div className="col-xs-4 text-right">
              <div className="checkbox checkbox-success" onChange={markDownSettingContainer.onChangeEnableXss}>
                <input type="checkbox" id="XssEnable" className="form-check-input" name="isEnabledXss" checked={markDownSettingContainer.state.isEnabledXss} />
                <label htmlFor="XssEnable">
                  { t('markdown_setting.Enable XSS prevention') }
                </label>
              </div>
            </div>
            {markDownSettingContainer.state.isEnabledXss && this.xssOptions()}
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
  return createSubscribedElement(XssForm, props, [AppContainer, MarkDownSettingContainer]);
};

XssForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  markDownSettingContainer: PropTypes.instanceOf(MarkDownSettingContainer).isRequired,
};

export default withTranslation()(XssFormWrapper);
