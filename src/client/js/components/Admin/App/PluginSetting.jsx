import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:app:pluginSetting');

class PluginSetting extends React.Component {

  constructor(props) {
    super(props);

    this.submitHandler = this.submitHandler.bind(this);
  }

  async submitHandler() {
    const { t, adminAppContainer } = this.props;

    try {
      await adminAppContainer.updatePluginSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.plugin_settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminAppContainer } = this.props;

    return (
      <React.Fragment>
        <p className="well">{t('admin:app_setting.enable_plugin_loading')}</p>

        <div className="row mb-5">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isEnabledPlugins"
                type="checkbox"
                checked={adminAppContainer.state.isEnabledPlugins}
                onChange={(e) => {
                  adminAppContainer.changeIsEnabledPlugins(e.target.checked);
                }}
              />
              <label htmlFor="isEnabledPlugins">{t('admin:app_setting.load_plugins')}</label>
            </div>
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.submitHandler} disabled={adminAppContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PluginSettingWrapper = (props) => {
  return createSubscribedElement(PluginSetting, props, [AppContainer, AdminAppContainer]);
};

PluginSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(PluginSettingWrapper);
