import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
// TODO: error notification (toast, loggerFactory)
// TODO: i18n

export const PluginInstallerForm = (): JSX.Element => {
  const { t } = useTranslation('admin');

  const submitHandler = useCallback(async() => {
    try {
      // await adminAppContainer.updateAppSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('app_settings') }));
    }
    catch (err) {
      toastError(err);
      // logger.error(err);
    }
  }, [t]);

  return (
    <>
      <div className='form-group row'>
        <label className="text-left text-md-right col-md-3 col-form-label">Plugin URL</label>
        {/* <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:plugins_extention.plugin_url')}</label> */}
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            // defaultValue={adminAppContainer.state.title || ''}
            // onChange={(e) => {
            //   adminAppContainer.changeTitle(e.target.value);
            // }}
            placeholder="https://github.com/weseek/growi-plugins/vibrant-dark-ui"
          />
          <p className="form-text text-muted">Install the plugin in GROWI: Enter the URL of the plugin repository and press the Update.</p>
          {/* <p className="form-text text-muted">{t('admin:app_setting.sitename_change')}</p> */}
        </div>
      </div>
      <div className='form-group row'>
        <label className="text-left text-md-right col-md-3 col-form-label">branch</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            // defaultValue={adminAppContainer.state.title || ''}
            // onChange={(e) => {
            //   adminAppContainer.changeTitle(e.target.value);
            // }}
            placeholder="main"
          />
          <p className="form-text text-muted">branch name</p>
        </div>
      </div>
      <div className='form-group row'>
        <label className="text-left text-md-right col-md-3 col-form-label">tag</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            // defaultValue={adminAppContainer.state.title || ''}
            // onChange={(e) => {
            //   adminAppContainer.changeTitle(e.target.value);
            // }}
            placeholder="tags"
          />
          <p className="form-text text-muted">tag name</p>
        </div>
      </div>

      <AdminUpdateButtonRow onClick={submitHandler} disabled={false}/>
      {/* <AdminUpdateButtonRow onClick={submitHandler} disabled={adminAppContainer.state.retrieveError != null} /> */}
    </>
  );
};
