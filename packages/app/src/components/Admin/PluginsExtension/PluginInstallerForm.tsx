import React, { useCallback } from 'react';

// TODO: error notification (toast, loggerFactory)
// TODO: i18n

export const PluginInstallerForm = () => {

  // const submitHandler = useCallback(async() => {
  //   try {
  //     await adminAppContainer.updateAppSettingHandler();
  //     // toastSuccess(t('toaster.update_successed', { target: t('app_settings') }));
  //   }
  //   catch (err) {
  //     toastError(err);
  //     logger.error(err);
  //   }
  // }, [adminAppContainer, t]);

  return (
    <>
      <div className='form-group row'>
        <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:app_setting.site_name')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            // defaultValue={adminAppContainer.state.title || ''}
            // onChange={(e) => {
            //   adminAppContainer.changeTitle(e.target.value);
            // }}
            placeholder="GROWI"
          />
          <p className="form-text text-muted">{t('admin:app_setting.sitename_change')}</p>
        </div>
      </div>

      {/* <AdminUpdateButtonRow onClick={submitHandler} disabled={adminAppContainer.state.retrieveError != null} /> */}
    </>
  );
};
