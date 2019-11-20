import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

const logger = loggerFactory('growi:importer');

class PluginSetting extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;

    this.state = {
    };
  }


  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <p className="well">{ t('app_setting.Enable plugin loading') }</p>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label className="col-xs-3 control-label">{ t('app_setting.Load plugins') }</label>
              <div className="col-xs-6">

                <div className="btn-group btn-toggle" data-toggle="buttons">
                  <label
                    className="btn btn-default btn-rounded btn-outline {% if getConfig('crowi', 'plugin:isEnabledPlugins') %}active{% endif %}"
                    data-active-class="primary"
                  >
                    <input
                      name="settingForm[plugin:isEnabledPlugins]"
                      value="true"
                      type="radio"
                    />
                    ON

                  </label>
                  <label
                    className="btn btn-default btn-rounded btn-outline {% if !getConfig('crowi', 'plugin:isEnabledPlugins') %}active{% endif %}"
                    data-active-class="default"
                  >
                    <input name="settingForm[plugin:isEnabledPlugins]" />
                    OFF
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <div className="col-xs-offset-3 col-xs-6">
                <input type="hidden" name="_csrf" value="{{ csrf() }}" />
                <button type="submit" className="btn btn-primary">
                  {t('app_setting.Update')}
                </button>
              </div>
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
const PluginSettingWrapper = (props) => {
  return createSubscribedElement(PluginSetting, props, [AppContainer]);
};

PluginSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(PluginSettingWrapper);
