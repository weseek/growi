/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class XssForm extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;

    this.state = {
      // TODO fetch correct value
      isEnabledXss: false,
      XssOption: 1,
      tagWhiteList: appContainer.config.tagWhiteList,
      attrWhiteList: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  }

  xssOptions() {
    const { t } = this.props;

    return (
      <fieldset className="form-group col-xs-12 my-3" id="xss-hide-when-disabled">
        <div className="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption1" name="XssOption" value="1" onChange={this.handleInputChange} />
          <label htmlFor="xssOption1">
            <p className="font-weight-bold">{ t('markdown_setting.Ignore all tags') }</p>
            <div className="m-t-15">
              { t('markdown_setting.Ignore all tags desc') }
            </div>
          </label>
        </div>

        <div className="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption2" name="XssOption" value="2" onChange={this.handleInputChange} />
          <label htmlFor="xssOption2">
            <p className="font-weight-bold">{ t('markdown_setting.Recommended setting') }</p>
            <div className="m-t-15">
              { t('markdown_setting.Tag names') }
              {/* TODO fetch correct defaultValue */}
              <textarea className="form-control xss-list" name="recommendedTags" rows="6" cols="40" readOnly defaultValue="recommendedWhitelist.tags" />
            </div>
            <div className="m-t-15">
              { t('markdown_setting.Tag attributes') }
              {/* TODO fetch correct defaultValue */}
              <textarea className="form-control xss-list" name="recommendedAttrs" rows="6" cols="40" readOnly defaultValue="recommendedWhitelist.attrs" />
            </div>
          </label>
        </div>

        <div className="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption3" name="XssOption" value="3" onChange={this.handleInputChange} />
          <label htmlFor="xssOption3">
            <p className="font-weight-bold">{ t('markdown_setting.Custom Whitelist') }</p>
            <div className="m-t-15">
              <div className="d-flex justify-content-between">
                { t('markdown_setting.Tag names') }
                <p id="btn-import-tags" className="btn btn-xs btn-primary">
                  { t('markdown_setting.import_recommended', 'tags') }
                </p>
              </div>
              <textarea className="form-control xss-list" type="text" name="tagWhiteList" rows="6" cols="40" placeholder="e.g. iframe, script, video..." defaultValue={this.state.tagWhiteList} onChange={this.handleInputChange} />
            </div>
            <div className="m-t-15">
              <div className="d-flex justify-content-between">
                { t('markdown_setting.Tag attributes') }
                <p id="btn-import-attrs" className="btn btn-xs btn-primary">
                  { t('markdown_setting.import_recommended', 'attributes') }
                </p>
              </div>
              <textarea className="form-control xss-list" name="attrWhiteList" rows="6" cols="40" placeholder="e.g. src, id, name..." defaultValue={this.state.attrWhiteList} onChange={this.handleInputChange} />
            </div>
          </label>
        </div>
      </fieldset>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <form className="row">
          <div className="form-group">
            <label className="col-xs-4 control-label text-right">
              { t('markdown_setting.Enable XSS prevention') }
            </label>
            <div className="col-xs-5">
              <input type="checkbox" name="isEnabledXss" checked={this.state.isEnabledXss} onChange={this.handleInputChange} />
            </div>
            {this.state.isEnabledXss && this.xssOptions()}
          </div>
          <div className="form-group my-3">
            <div className="col-xs-offset-4 col-xs-5">
              <div className="btn btn-primary">{ t('Update') }</div>
            </div>
          </div>
        </form>
      </React.Fragment>
    );
  }

}

const XssFormWrapper = (props) => {
  return createSubscribedElement(XssForm, props, [AppContainer]);
};

XssForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

};

export default withTranslation()(XssFormWrapper);
