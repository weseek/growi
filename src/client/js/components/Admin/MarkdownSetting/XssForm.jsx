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
      isEnabledXss: false,
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
      <fieldset class="form-group col-xs-12 my-3" id="xss-hide-when-disabled">
        <div class="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption1" name="{{nameForXssOption}}" value="1" />
          <label for="xssOption1">
            <p class="font-weight-bold">{ t('markdown_setting.Ignore all tags') }</p>
            <div class="m-t-15">
              { t('markdown_setting.Ignore all tags desc') }
            </div>
          </label>
        </div>

        <div class="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption2" name="{{nameForXssOption}}" value="2" />
          <label for="xssOption2">
            <p class="font-weight-bold">{ t('markdown_setting.Recommended setting') }</p>
            <div class="m-t-15">
              { t('markdown_setting.Tag names') }
              <textarea class="form-control xss-list" name="recommendedTags" rows="6" cols="40" readonly>recommendedWhitelist.tags</textarea>
            </div>
            <div class="m-t-15">
              { t('markdown_setting.Tag attributes') }
              <textarea className="form-control xss-list" name="recommendedAttrs" rows="6" cols="40" readonly>recommendedWhitelist.attrs</textarea>
            </div>
          </label>
        </div>

        <div class="col-xs-4 radio radio-primary">
          <input type="radio" id="xssOption3" name="{{nameForXssOption}}" value="3" />
          <label for="xssOption3">
            <p class="font-weight-bold">{ t('markdown_setting.Custom Whitelist') }</p>
            <div class="m-t-15">
              <div class="d-flex justify-content-between">
                { t('markdown_setting.Tag names') }
                <p id="btn-import-tags" class="btn btn-xs btn-primary">
                  { t('markdown_setting.import_recommended', 'tags') }
                </p>
              </div>
              <textarea class="form-control xss-list" type="text" name="markdownSetting[markdown:xss:tagWhiteList]" rows="6" cols="40" placeholder="e.g. iframe, script, video...">markdownSetting['markdown:xss:tagWhiteList']</textarea>
            </div>
            <div class="m-t-15">
              <div class="d-flex justify-content-between">
                { t('markdown_setting.Tag attributes') }
                <p id="btn-import-attrs" class="btn btn-xs btn-primary">
                  { t('markdown_setting.import_recommended', 'attributes') }
                </p>
              </div>
              <textarea class="form-control xss-list" name="markdownSetting[markdown:xss:attrWhiteList]" rows="6" cols="40" placeholder="e.g. src, id, name...">markdownSetting['markdown:xss:attrWhiteList']</textarea>
            </div>
          </label>
        </div>
      </fieldset>
    )
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
              <button type="submit" className="btn btn-primary">{ t('Update') }</button>
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
