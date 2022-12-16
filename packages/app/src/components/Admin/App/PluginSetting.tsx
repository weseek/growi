import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:app:pluginSetting');

type Props = {
  adminAppContainer: AdminAppContainer,
}

const PluginSetting = (props: Props) => {
  const { t } = useTranslation();
  const { adminAppContainer } = props;


  const submitHandler = useCallback(async() => {
    try {
      await adminAppContainer.updatePluginSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.plugin_settings'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }, [adminAppContainer, t]);

  return (
    <>
      <p className="card well">{t('admin:app_setting.enable_plugin_loading')}</p>

      <div className="row form-group mb-5">
        <div className="offset-3 col-6 text-left">
          <div className="custom-control custom-checkbox custom-checkbox-success">
            <input
              id="isEnabledPlugins"
              className="custom-control-input"
              type="checkbox"
              checked={adminAppContainer.state.isEnabledPlugins}
              onChange={(e) => {
                adminAppContainer.changeIsEnabledPlugins(e.target.checked);
              }}
            />
            <label className="custom-control-label" htmlFor="isEnabledPlugins">{t('admin:app_setting.load_plugins')}</label>
          </div>
        </div>
      </div>

      <AdminUpdateButtonRow onClick={submitHandler} disabled={adminAppContainer.state.retrieveError != null} />
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const PluginSettingWrapper = withUnstatedContainers(PluginSetting, [AdminAppContainer]);

export default PluginSettingWrapper;
