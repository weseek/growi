import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:app:pluginSetting');

class PluginSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // TODO GW-690 fetch from db
      isEnabledPlugins: true,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.switchIsEnabledPlugins = this.switchIsEnabledPlugins.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      // TODO GW-690 post apiV3
      toastSuccess(t('app_setting.update', { target: 'Plugin Setting' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  switchIsEnabledPlugins() {
    this.setState({ isEnabledPlugins: !this.state.isEnabledPlugins });
  }


  render() {
    const { t } = this.props;

    return (
      <React.Fragment>

        <p className="well">{ t('app_setting.Enable plugin loading') }</p>

        <div className="row mb-5">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isEnabledPlugins"
                type="checkbox"
                checked={this.state.isEnabledPlugins}
                onChange={this.switchIsEnabledPlugins}
              />
              <label htmlFor="isEnabledPlugins">
                { t('app_setting.Load plugins') }
              </label>
            </div>
          </div>
        </div>

        <div className="row my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <div className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</div>
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
