/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class MarkdownSetting extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;

    this.state = {
      isEnabledLinebreaks: appContainer.config.isEnabledLinebreaks,
      isEnabledLinebreaksInComments: appContainer.config.isEnabledLinebreaksInComments,
      isEnabledXss: appContainer.config.isEnabledXss,
    };
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
                  <div className="btn-group btn-toggle" data-toggle="buttons">
                    <label className={` btn btn-default btn-rounded btn-outline ${this.state.isEnabledLinebreaks && 'active'}`} data-active-class="primary">
                      <input name="lineBreakEnabled" value="true" type="radio" checked={this.state.isEnabledLinebreaks} />
                        ON
                    </label>
                    <label className={`btn btn-default btn-rounded btn-outline ${!this.state.isEnabledLinebreaks && 'active'}`} data-active-class="default">
                      <input name="lineBreakEnabled" value="false" type="radio" checked={!this.state.isEnabledLinebreaks} />
                        OFF
                    </label>
                  </div>
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
                  <div className="btn-group btn-toggle" data-toggle="buttons">
                    <label className={`btn btn-default btn-rounded btn-outline ${this.state.isEnabledLinebreaksInComments && 'active'}`} data-active-class="primary">
                      <input name="lineBreakInComments" value="true" type="radio" checked={this.state.isEnabledLinebreaksInComments} />
                        ON
                    </label>
                    <label className={`btn btn-default btn-rounded btn-outline ${!this.state.isEnabledLinebreaksInComments && 'active'}`} data-active-class="default">
                      <input name="lineBreakInComments" value="false" type="radio" checked={!this.state.isEnabledLinebreaksInComments} />
                        OFF
                    </label>
                  </div>
                  <p className="help-block">{ t('markdown_setting.Enable Line Break for comment desc') }</p>
                </div>
              </div>
            </fieldset>
          </div>
          <div className="form-group my-3">
            <div className="col-xs-offset-4 col-xs-5">
              <input type="hidden" name="_csrf" value="{{ csrf() }}" />
              <button type="submit" className="btn btn-primary">{ t('Update') }</button>
            </div>
          </div>
        </div>

        <div className="row my-3">
          <div className="form-group">
            <legend>{ t('markdown_setting.presentation_setting') }</legend>
            <p className="well">{ t('markdown_setting.presentation_setting_desc') }</p>
          </div>
          <fieldset className="form-group row my-2">

            <label className="col-xs-3 control-label text-right">
              { t('markdown_setting.Page break setting') }
            </label>

            <div className="col-xs-3 radio radio-primary">
              <input type="radio" id="pageBreakOption1" name="nameForPageBreakOption" value="1" />
              <label htmlFor="pageBreakOption1">
                <p className="font-weight-bold">{ t('markdown_setting.Preset one separator') }</p>
                <p className="mt-3">
                  { t('markdown_setting.Preset one separator desc') }
                  <pre><code>{ t('markdown_setting.Preset one separator value') }</code></pre>
                </p>
              </label>
            </div>

            <div className="col-xs-3 radio radio-primary mt-3">
              <input type="radio" id="pageBreakOption2" name="nameForPageBreakOption" value="2" />
              <label htmlFor="pageBreakOption2">
                <p className="font-weight-bold">{ t('markdown_setting.Preset two separator') }</p>
                <p className="mt-3">
                  { t('markdown_setting.Preset two separator desc') }
                  <pre><code>{ t('markdown_setting.Preset two separator value') }</code></pre>
                </p>
              </label>
            </div>

            <div className="col-xs-3 radio radio-primary mt-3">
              <input type="radio" id="pageBreakOption3" name="nameForPageBreakOption" value="3" />
              <label htmlFor="pageBreakOption3">
                <p className="font-weight-bold">{ t('markdown_setting.Custom separator') }</p>
                <p className="mt-3">
                  { t('markdown_setting.Custom separator desc') }
                  <div>
                    <input className="form-control" />
                  </div>
                </p>
              </label>
            </div>

            <div className="form-group my-3">
              <div className="col-xs-offset-4 col-xs-5">
                <input type="hidden" name="_csrf" value="{{ csrf() }}" />
                <button type="submit" className="btn btn-primary">{ t('Update') }</button>
              </div>
            </div>

          </fieldset>
        </div>

        <div className="row my-3">
          <div className="form-group">
            <legend>{ t('markdown_setting.XSS_setting') }</legend>
            <p className="well">{ t('markdown_setting.XSS_setting_desc') }</p>
          </div>
          <fieldset className="row">
            <div className="form-group">
              <label className="col-xs-4 control-label text-right">
                { t('markdown_setting.Enable XSS prevention') }
              </label>
              <div className="col-xs-5">
                <div className="btn-group btn-toggle" data-toggle="buttons">
                  <label className={`btn btn-default btn-rounded btn-outline ${this.state.isEnabledXss && 'active'}`} data-active-class="primary">
                    <input name="IsXssEnabled" value="true" type="radio" checked={this.state.isEnabledXss} />
                      ON
                  </label>
                  <label className={`btn btn-default btn-rounded btn-outline ${!this.state.isEnabledXss && 'active'}`} data-active-class="default">
                    <input name="IsXssEnabled" value="false" type="radio" checked={!this.state.isEnabledXss} />
                      OFF
                  </label>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
      </React.Fragment>
    );
  }

}

const MarkdownSettingWrapper = (props) => {
  return createSubscribedElement(MarkdownSetting, props, [AppContainer]);
};

MarkdownSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

};

export default withTranslation()(MarkdownSettingWrapper);
